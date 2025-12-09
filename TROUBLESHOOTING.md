# 🔧 Solução de Problemas - Conexão Recusada

## Por que a conexão com a API está sendo recusada?

A mensagem "conexão recusada" ou "Failed to fetch" geralmente indica um dos seguintes problemas:

---

## 1. ❌ API não está rodando

**Sintoma:** Erro "Failed to fetch" ou "ERR_CONNECTION_REFUSED"

**Solução:**
1. Verifique se sua API .NET está executando
2. Abra o terminal onde a API está rodando e verifique se há erros
3. Teste acessando diretamente no navegador a URL da sua API

**Como verificar:**
```bash
# No terminal da API, você deve ver algo como:
# "Now listening on: https://localhost:XXXX"
```

---

## 2. 🔒 Certificado SSL não aceito

**Sintoma:** Erro "ERR_SSL_PROTOCOL_ERROR" ou "NET::ERR_CERT_AUTHORITY_INVALID"

**Solução:**

### Chrome/Edge:
1. Acesse a URL da sua API diretamente no navegador
2. Você verá uma página de aviso de segurança
3. Clique em **"Avançado"** ou **"Advanced"**
4. Clique em **"Continuar para localhost (não seguro)"** ou **"Proceed to localhost (unsafe)"**

### Firefox:
1. Acesse a URL da sua API diretamente no navegador
2. Clique em **"Avançado"** ou **"Advanced"**
3. Clique em **"Aceitar o risco e continuar"** ou **"Accept the Risk and Continue"**

### Alternativa: Usar HTTP (apenas para desenvolvimento)
Se preferir, altere a URL no código para HTTP:
```javascript
// const API_BASE_URL = 'http://localhost:7223/api';
```

**⚠️ Atenção:** HTTP não é seguro para produção, use apenas em desenvolvimento local.

---

## 3. 🌐 CORS não configurado

**Sintoma:** Erro "CORS policy" ou "Access-Control-Allow-Origin"

**Solução:**

No seu arquivo `Program.cs` ou `Startup.cs` da API, adicione:

```csharp
// No Program.cs (ASP.NET Core 6+)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Depois de builder.Build()
var app = builder.Build();

// Antes de app.MapControllers() ou app.UseEndpoints()
app.UseCors("AllowAll");
```

Ou para desenvolvimento mais seguro:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", policy =>
    {
        policy.WithOrigins("http://localhost:8000", "http://127.0.0.1:8000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

---

## 4. 🔥 Firewall bloqueando

**Sintoma:** Conexão funciona em alguns momentos mas falha em outros

**Solução:**
1. Verifique se o Windows Firewall está bloqueando a porta 7223
2. Adicione uma exceção para a porta 7223 no firewall
3. Verifique se seu antivírus não está bloqueando conexões locais

---

## 5. 📍 Porta incorreta

**Sintoma:** API está rodando mas em outra porta

**Solução:**
1. Verifique em qual porta sua API está realmente rodando
2. Procure no terminal da API por: `"Now listening on: https://localhost:XXXX"`
3. Atualize a URL no código:
```javascript
const API_BASE_URL = 'https://localhost:XXXX/api'; // Substitua XXXX pela porta correta
```

---

## 6. 🔍 Como diagnosticar

### Passo 1: Abra o Console do Navegador
1. Pressione **F12** no navegador
2. Vá para a aba **Console**
3. Procure por mensagens de erro detalhadas

### Passo 2: Verifique a aba Network
1. No DevTools (F12), vá para a aba **Network**
2. Recarregue a página
3. Procure pela requisição que falhou
4. Clique nela para ver detalhes do erro

### Passo 3: Teste a API diretamente
1. Abra uma nova aba no navegador
2. Acesse a URL da sua API
3. Se funcionar, o problema é no frontend
4. Se não funcionar, o problema é na API

### Passo 4: Teste com Postman/Insomnia
1. Abra o Postman ou Insomnia
2. Faça uma requisição GET para a URL da sua API
3. Se funcionar, o problema é CORS ou configuração do navegador
4. Se não funcionar, o problema é na API

---

## 📋 Checklist de Verificação

Marque cada item conforme verifica:

- [ ] API está rodando e sem erros no terminal
- [ ] Certificado SSL foi aceito no navegador
- [ ] CORS está configurado na API
- [ ] Porta da API está correta (7223)
- [ ] Firewall não está bloqueando
- [ ] Testei a API diretamente no navegador
- [ ] Console do navegador (F12) foi verificado
- [ ] Aba Network do DevTools foi verificada

---

## 💡 Dicas

1. **Sempre verifique o console primeiro** - A maioria dos erros mostra detalhes úteis lá
2. **Teste a API diretamente** - Se funcionar no navegador, o problema é no código frontend
3. **Use HTTP para desenvolvimento** - É mais fácil que lidar com certificados SSL auto-assinados
4. **Verifique os logs da API** - Eles podem mostrar o que está acontecendo no backend

---

## 🆘 Ainda não funciona?

Se após seguir todos os passos o problema persistir:

1. Compartilhe a mensagem de erro completa do console (F12)
2. Compartilhe a resposta da aba Network (F12 → Network)
3. Verifique se a API está realmente respondendo (teste com Postman)
4. Verifique os logs da API no terminal




