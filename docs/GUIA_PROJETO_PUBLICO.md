# Guia para publicar o código sem hospedar a aplicação

Este roteiro documenta o processo usado no CuraFamília: tornar o repositório
público para portfólio mantendo a aplicação, o banco e todos os dados somente
no computador ou dispositivo do usuário.

## 1. Preserve um backup privado

- crie um repositório privado separado;
- envie branches e tags importantes;
- confirme a visibilidade `Private` pelo GitHub;
- mantenha o backup sincronizado depois de mudanças relevantes.

## 2. Audite dados e histórico

Procure no estado atual e nos commits anteriores:

- `.env`, `.dev.vars`, tokens e chaves;
- bancos, backups, PDFs, fotos e exportações;
- certificados, keystores, APKs e instaladores;
- nomes, e-mails e informações médicas reais;
- domínios, servidores ou identificadores privados.

Revogue uma credencial real imediatamente se ela tiver sido publicada. Apagar o
arquivo de um commit novo não remove o conteúdo do histórico.

## 3. Proteja arquivos locais

O `.gitignore` deve cobrir segredos, bancos, builds e artefatos nativos. Arquivos
de exemplo devem conter somente placeholders. Um scanner de segredos deve rodar
antes do envio e novamente no CI.

## 4. Separe código público de aplicação pública

Um repositório `Public` não exige uma aplicação hospedada. Para um produto com
dados de saúde:

- não configure GitHub Pages;
- não adicione domínio ou URL de demonstração;
- não publique backend ou banco;
- não adicione `project_id` a `.openai/hosting.json`;
- documente claramente que `localhost` é o único ambiente suportado.

## 5. Prepare a apresentação técnica

Inclua no repositório:

- README com problema, recursos, arquitetura e início rápido;
- estudo de caso com decisões e limitações;
- roadmap sem promessas de data;
- política de segurança e guia de contribuição;
- templates de bug, melhoria e pull request;
- CI com testes, builds e scan de segredos;
- descrição e tópicos coerentes no GitHub.

Capturas de tela são opcionais. Quando usadas, devem mostrar exclusivamente
dados fictícios e não podem revelar notificações, caminhos pessoais ou arquivos
recentes.

## 6. Valide antes de enviar

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build:mobile
```

Para validar o cliente Android no Windows:

```powershell
npm run android:apk
```

## Checklist

- [ ] Backup privado atualizado
- [ ] Repositório público sem dados reais ou segredos
- [ ] Histórico verificado com scanner de segredos
- [ ] Arquivos locais e artefatos ignorados
- [ ] README, estudo de caso e roadmap revisados
- [ ] Templates e política de segurança disponíveis
- [ ] CI aprovado
- [ ] GitHub Pages e outras hospedagens desativadas
- [ ] `.openai/hosting.json` sem `project_id`
- [ ] Ausência de licença documentada conscientemente

O objetivo é permitir avaliação do código sem ampliar a superfície de risco da
aplicação nem transformar dados locais em um serviço público.
