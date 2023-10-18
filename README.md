# The Interactive Transformer

🚧 work in progress 🚧

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
