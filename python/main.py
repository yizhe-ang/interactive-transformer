from typing import Union
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformer_lens import HookedTransformer, HookedTransformerConfig
import torch as t
import einops


BASE_DIR = Path(__file__).resolve(strict=True).parent
device = t.device("cuda" if t.cuda.is_available() else "cpu")

# Init app
app = FastAPI()

origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextInput(BaseModel):
    text: str


def process_tensor(tensor):
    # FIXME: Any processing required? Rounding etc. to reduce memory footprint
    return tensor.cpu().numpy().tolist()


@app.on_event("startup")
def startup_event():
    # FIXME: Make sure app works with different models

    # Init TransformerLens

    # gpt2-small
    # model: HookedTransformer = HookedTransformer.from_pretrained("gpt2-small")

    # 2L attention-only transformer
    cfg = HookedTransformerConfig(
        d_model=768,
        d_head=64,
        n_heads=12,
        n_layers=2,
        n_ctx=2048,
        d_vocab=50278,
        attention_dir="causal",
        attn_only=True,  # defaults to False
        tokenizer_name="EleutherAI/gpt-neox-20b",
        seed=398,
        use_attn_result=True,
        normalization_type=None,  # defaults to "LN", i.e. layernorm with weights & biases
        positional_embedding_type="shortformer",
    )

    weights_dir = BASE_DIR / "model" / "attn_only_2L_half.pth"

    model = HookedTransformer(cfg)
    pretrained_weights = t.load(weights_dir, map_location=device)
    model.load_state_dict(pretrained_weights)

    app.package = {"model": model}


@app.get("/model_config")
def get_model_config():
    cfg = app.package["model"].cfg

    config = {"numLayers": cfg.n_layers, "numHeads": cfg.n_heads}

    return config


@app.post("/input_text")
def input_text(payload: TextInput):
    model = app.package["model"]

    text = payload.text

    str_tokens = model.to_str_tokens(text)
    tokens = model.to_tokens(text)
    logits, cache = model.run_with_cache(tokens, remove_batch_dim=True)

    app.package["cache"] = cache
    app.package["tokens"] = tokens[0]

    return str_tokens


# @app.get("/inference")
# def read_inference():
#     model_description_text = """## Loading Models

# HookedTransformer comes loaded with >40 open source GPT-style models. You can load any of them in with `HookedTransformer.from_pretrained(MODEL_NAME)`. Each model is loaded into the consistent HookedTransformer architecture, designed to be clean, consistent and interpretability-friendly.

# For this demo notebook we'll look at GPT-2 Small, an 80M parameter model. To try the model the model out, let's find the loss on this paragraph!"""

#     loss = model(model_description_text, return_type="loss").item()

#     return {"loss": loss}


@app.get("/attention_maps/{layer}")
def get_attention_maps(layer: int):
    # [n_heads, n_tokens, n_tokens]
    attention_maps = process_tensor(app.package["cache"]["pattern", layer])

    # return {"value": attention_maps}
    return attention_maps


@app.get("/logit_attributions")
def get_logit_attributions():
    cache = app.package["cache"]
    model = app.package["model"]
    tokens = app.package["tokens"]

    with t.inference_mode():
        embed = cache["embed"]
        layer_results = [cache["result", i] for i in range(model.cfg.n_layers)]

        W_U = model.W_U
        W_U_correct_tokens = W_U[:, tokens[1:]]

        # FIXME:
        direct_attributions = einops.einsum(
            W_U_correct_tokens, embed[:-1], "emb seq, seq emb -> seq"
        )
        layer_attributions = [
            einops.einsum(
                W_U_correct_tokens, results[:-1], "emb seq, seq nhead emb -> seq nhead"
            )
            for results in layer_results
        ]

        # (seq_len - 1, n_components)
        attributions = t.concat(
            [direct_attributions.unsqueeze(-1), *layer_attributions], dim=-1
        )

    return process_tensor(attributions)
