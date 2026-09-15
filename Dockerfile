# Baloo cloud IDE – code-server som enda tjänst (Fly.io kör EN container per app)
FROM codercom/code-server:4.96.3

# Projektet in i standard-workspace (/home/coder/project)
COPY --chown=coder:coder baloo-extension /home/coder/project/baloo-extension
COPY --chown=coder:coder extension /home/coder/project/extension
COPY --chown=coder:coder baloo-mobil /home/coder/project/baloo-mobil
COPY --chown=coder:coder Baloo-safety /home/coder/project/Baloo-safety
COPY --chown=coder:coder baloo-cloud-kit /home/coder/project/baloo-cloud-kit
COPY --chown=coder:coder oracle-move-kit /home/coder/project/oracle-move-kit
COPY --chown=coder:coder README.md LICENSE docker-compose.yml fly.toml /home/coder/project/

# code-server-image:startar redan code-server på 0.0.0.0:8080 med PASSWORD-env
