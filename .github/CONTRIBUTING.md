# Como contribuir

Obrigado pelo interesse no CuraFamília. O código é público para avaliação e
portfólio. A aplicação real continua local, enquanto a demonstração pública é
estática e usa somente dados fictícios na sessão do navegador.

## Fluxo recomendado

1. Abra uma issue antes de iniciar mudanças maiores.
2. Crie uma branch curta e focada.
3. Implemente a alteração usando somente dados fictícios.
4. Execute toda a validação local.
5. Abra um pull request explicando problema, solução e evidências.

## Privacidade e segurança

- não inclua nomes, documentos, fotos ou informações médicas reais;
- não versione `.dev.vars`, bancos, backups, certificados, APKs ou builds;
- não conecte a demonstração à API real, D1, uploads ou qualquer backend;
- não use Sites nem adicione `project_id` a `.openai/hosting.json`;
- revise logs e capturas para remover caminhos e notificações pessoais;
- relate vulnerabilidades pelo canal privado em [SECURITY.md](SECURITY.md).

## Desenvolvimento

No diretório `app/`:

```bash
npm ci
npm run dev
```

Antes de abrir um pull request:

```bash
npm run typecheck
npm run lint
npm test
npm run build:demo
npm run build:mobile
```

Mudanças na integração Android também devem validar o APK. No Windows:

```powershell
npm run android:apk
```

Capturas de interface devem usar os dados fictícios incluídos no projeto.
