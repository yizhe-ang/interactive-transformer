# The Interactive Transformer

🚧 work in progress 🚧



https://github.com/yizhe-ang/interactive-transformer/assets/17507891/e49ba173-a015-467b-b8f6-32f6cbd6fcf3



## Setup
```bash
git clone https://github.com/yizhe-ang/interactive-transformer.git
```

### Launch Backend
```bash
cd python
```
Install Python environment

```bash
poetry install
```

For non-CUDA CPU version, additionally run:

```bash
poetry source add -p explicit pytorch https://download.pytorch.org/whl/cpu
poetry add --source pytorch torch torchvision
```

Launch the backend server

```bash
poetry shell

uvicorn main:app --reload
```

### Launch Application
```bash
cd svelte
```
Install dependencies

```bash
npm install --force
```

Launch application
```bash
npm run dev
```

The application will run by default on http://localhost:5173/
