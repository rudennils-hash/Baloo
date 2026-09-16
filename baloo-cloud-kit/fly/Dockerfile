# Baloo cloud IDE – code-server (VS Code i webbläsaren)
# OBS: huvud-Dockerfile ligger i repots root – den här är en kopia
# för portabilitet om baloo-cloud-kit ska användas fristående.
FROM codercom/code-server:4.96.3

COPY --chown=coder:coder codeserver_user_data/ /home/coder/seed/

COPY --chown=coder:coder baloo-extension /home/coder/project/baloo-extension
COPY --chown=coder:coder extension /home/coder/project/extension
COPY --chown=coder:coder baloo-mobil /home/coder/project/baloo-mobil
COPY --chown=coder:coder Baloo-safety /home/coder/project/Baloo-safety
COPY --chown=coder:coder baloo-cloud-kit /home/coder/project/baloo-cloud-kit
COPY --chown=coder:coder oracle-move-kit /home/coder/project/oracle-move-kit
COPY --chown=coder:coder baloo-logga /home/coder/project/baloo-logga
COPY --chown=coder:coder Baloo-VgdsApp /home/coder/project/Baloo-VgdsApp
COPY --chown=coder:coder README.md LICENSE docker-compose.yml fly.toml /home/coder/project/

COPY --chown=coder:coder entrypoint.d/ /home/coder/entrypoint.d/

COPY --chown=coder:coder docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV PASSWORD_REQUIRED=1
ENV CODE_SERVER_BIND_ADDR=0.0.0.0:8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["--bind-addr", "0.0.0.0:8080", "--auth", "password", "/home/coder/project"]
