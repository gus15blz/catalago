# Origem Natural - Catálogo HTML

Projeto de catálogo em HTML puro com integração à API.

## 🚀 Como executar

### Opção 1: Abrir diretamente no navegador
1. Abra o arquivo `index.html` diretamente no navegador
2. **Nota**: Pode haver problemas de CORS se a API estiver em um domínio diferente

### Opção 2: Usar um servidor local (Recomendado)

#### Com Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Com Node.js (http-server):
```bash
npx http-server -p 8000
```

#### Com PHP:
```bash
php -S localhost:8000
```

3. Acesse `http://localhost:8000` no navegador

## 📁 Estrutura do projeto

```
catalago/
├── index.html      # HTML principal
├── style.css       # Estilos
├── script.js       # Lógica JavaScript (fetch API, renderização)
└── README.md       # Este arquivo
```

## 🔌 Integração com API

O projeto está configurado para buscar produtos da API em `https://localhost:7223/api/Produto`.

### Configuração da API

A URL da API pode ser alterada no arquivo `script.js`:

```javascript
const API_BASE_URL = 'https://localhost:7223/api';
const API_PRODUTOS_URL = `${API_BASE_URL}/Produto`;
```

### Funcionalidades

- ✅ Busca produtos da API automaticamente
- ✅ Detecta automaticamente campos de imagem (múltiplos formatos)
- ✅ Converte URLs de imagem para base64
- ✅ Fallback para usar URL diretamente se base64 falhar
- ✅ Tratamento de erros e estados de loading
- ✅ Logs de debug no console

### Campos esperados da API

O código aceita diferentes formatos de campos (PascalCase ou camelCase):
- `nome` / `Nome` / `nomeProduto` / `NomeProduto`
- `descricao` / `Descricao` / `descricaoProduto` / `DescricaoProduto`
- `preco` / `Preco` / `valor` / `Valor`
- `imagem` / `Imagem` / `imagemUrl` / `ImagemUrl` / `foto` / `Foto` / etc.

## ⚠️ Notas importantes

- Certifique-se de que a API está rodando antes de abrir o HTML
- Se houver problemas de CORS, configure o CORS na sua API backend
- Se o certificado SSL for auto-assinado, o navegador pode bloquear. Nesse caso, aceite o certificado ou use HTTP
- Abra o console do navegador (F12) para ver logs de debug

## 🐛 Debug

O código inclui logs detalhados no console do navegador:
- Dados recebidos da API
- Campos encontrados em cada produto
- Tentativas de carregar imagens
- Erros e falhas

Abra o console (F12 → Console) para ver as informações de debug.
