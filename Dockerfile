# Baloo cloud IDE – code-server (VS Code i webbläsaren)
FROM codercom/code-server:4.137.0

# ---- Seed-inställningar sparas på annan plats (kopieras till volym vid första start) ----
COPY --chown=coder:coder codeserver_user_data/ /home/coder/seed/

# ---- Projektet in i standard-workspace (/home/coder/project) ----
COPY --chown=coder:coder baloo-extension /home/coder/project/baloo-extension
COPY --chown=coder:coder extension /home/coder/project/extension
COPY --chown=coder:coder baloo-mobil /home/coder/project/baloo-mobil
COPY --chown=coder:coder Baloo-safety /home/coder/project/Baloo-safety
COPY --chown=coder:coder baloo-cloud-kit /home/coder/project/baloo-cloud-kit
COPY --chown=coder:coder oracle-move-kit /home/coder/project/oracle-move-kit
COPY --chown=coder:coder baloo-logga /home/coder/project/baloo-logga
COPY --chown=coder:coder Baloo-VgdsApp /home/coder/project/Baloo-VgdsApp
COPY --chown=coder:coder README.md LICENSE docker-compose.yml fly.toml /home/coder/project/

# Litet hjälpskript som kopierar seed -> volym vid allra första start
COPY --chown=coder:coder docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Säkerhet: lösenord obligatoriskt (sätts som Fly.secret, aldrig i bilden)
ENV PASSWORD_REQUIRED=1

# Se till att code-server alltid bindar på 0.0.0.0:8080
ENV CODE_SERVER_BIND_ADDR=0.0.0.0:8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["--bind-addr", "0.0.0.0:8080", "--auth", "password", "/home/coder/project"]