# CuraFamília

Aplicação local para organizar familiares, medicamentos, horários, registros de doses e documentos de saúde. O mesmo componente React atende à experiência web e ao aplicativo Android empacotado em uma `WebView`.

> Este projeto é exclusivamente local. Não publique nem implante a aplicação em um provedor de hospedagem: o backend não possui autenticação multiusuário e manipula dados sensíveis de saúde.

## Requisitos

- Node.js `>=22.13.0` (Node 24 LTS recomendado)
- Java/Android SDK compatíveis com Android 34, apenas para gerar o APK

## Desenvolvimento local

```bash
npm install
npm run dev
```

O servidor local oferece a interface e a API no mesmo endereço. O binding D1 `DB` é simulado localmente pelo plugin do Cloudflare e a tabela necessária é criada de forma idempotente pela aplicação. Na primeira execução, `scripts/dev.mjs` cria uma chave aleatória em `.dev.vars`, limita o arquivo ao usuário atual e não mostra a chave no terminal.

Comandos úteis:

- `npm run dev`: inicia a aplicação web local;
- `npm start`: atalho para o mesmo servidor local, sempre restrito a `127.0.0.1`;
- `npm run build`: valida o build web;
- `npm test`: executa o build e os testes;
- `npm run build:mobile`: gera os arquivos estáticos usados pelo Android;
- `npm run android:apk`: gera o APK de depuração no Windows.

## Arquitetura

- `app/page.tsx`: interface principal, regras de interação e sincronização;
- `app/api/state/route.ts`: API local `GET`/`PUT` para persistência;
- `lib/health-state.ts`: contrato compartilhado e validação dos dados;
- `db/`: schema Drizzle e acesso ao D1;
- `worker/`: entrada Vinext/Cloudflare usada pelo servidor local;
- `mobile/`: entrada Vite que reutiliza a tela principal;
- `android/`: shell nativo, scanner de documentos e ponte JavaScript;
- `tests/`: testes do HTML renderizado e do contrato de dados.

## Backend local

### `GET /api/state`

Retorna o snapshot familiar atual, sua revisão e a data da última alteração. Quando o banco ainda está vazio, retorna `state: null` e `revision: 0`.

### `PUT /api/state`

Recebe:

```json
{
  "state": {
    "members": [],
    "drugs": [],
    "presentations": [],
    "routines": [],
    "logs": [],
    "documents": []
  },
  "expectedRevision": 0
}
```

A API valida tipos, tamanhos, formatos e relacionamentos antes de persistir. Atualizações concorrentes retornam `409` com a revisão atual. As respostas usam `Cache-Control: no-store`, requisições de escrita precisam ser de mesma origem e hosts que não sejam locais recebem `403`.

Antes de entrar no D1, o snapshot completo é criptografado com AES-256-GCM usando `LOCAL_DATA_ENCRYPTION_KEY`. O frontend não grava novos dados sensíveis no `localStorage`: ele apenas lê uma instalação antiga uma vez e remove essa cópia depois que a migração segura é confirmada. Sem backend, a versão web mantém alterações somente durante a sessão.

No APK, o app continua totalmente offline. Estado, fotos incorporadas e PDFs digitalizados são criptografados por uma chave AES não exportável do Android Keystore. Documentos legados em texto puro são migrados em segundo plano, o backup do aplicativo está desabilitado e a WebView bloqueia navegação e recursos fora da origem permitida.

## Privacidade

O estado contém nomes, fotos, observações médicas, medicamentos, histórico de doses e documentos. Use apenas em dispositivo confiável e não inclua bancos, `.dev.vars`, arquivos de ambiente, chaves de assinatura ou documentos reais no Git.

Guarde uma cópia protegida de `.dev.vars`: perder ou trocar `LOCAL_DATA_ENCRYPTION_KEY` torna o banco local existente ilegível. A chave do Android é gerenciada pelo próprio sistema e os dados deixam de ser recuperáveis se ela for invalidada ou se o aplicativo for removido.
