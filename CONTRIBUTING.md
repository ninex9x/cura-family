# Como contribuir

Obrigado pelo interesse no CuraFamília. O código é público para avaliação e
portfólio, mas a aplicação continua destinada exclusivamente à execução local.

## Fluxo recomendado

1. Abra uma issue antes de iniciar mudanças maiores.
2. Crie uma branch curta e focada.
3. Implemente a alteração usando somente dados fictícios.
4. Execute toda a validação local.
5. Abra um pull request explicando problema, solução e evidências.

## Privacidade e segurança

- não inclua nomes, documentos, fotos ou informações médicas reais;
- não versione `.dev.vars`, bancos, backups, certificados, APKs ou builds;
- não adicione domínio, configuração de deploy ou `project_id`;
- revise logs e capturas para remover caminhos e notificações pessoais;
- relate vulnerabilidades pelo canal privado em [SECURITY.md](SECURITY.md).

## Desenvolvimento

```bash
npm ci
npm run dev
```

Antes de abrir um pull request:

```bash
npm run typecheck
npm run lint
npm test
npm run build:mobile
```

Mudanças na integração Android também devem validar o APK. No Windows:

```powershell
npm run android:apk
```

Capturas de interface devem usar os dados fictícios incluídos no projeto.
