# Contribuindo

Obrigado pelo interesse no CuraFamília. O código é público para estudo e portfólio, mas o aplicativo continua destinado exclusivamente à execução local.

## Antes de começar

- não inclua nomes, documentos, fotos ou informações médicas reais;
- não registre `.dev.vars`, bancos, chaves, certificados, APKs ou artefatos de build;
- não adicione configuração de deploy, domínio público ou `project_id`;
- use dados fictícios em testes e exemplos.

## Desenvolvimento

```bash
npm ci
npm run dev
```

Antes de abrir um pull request, execute:

```bash
npm run typecheck
npm run lint
npm test
npm run build:mobile
```

Relate vulnerabilidades pelo canal privado descrito em `SECURITY.md`, nunca em uma issue pública.
