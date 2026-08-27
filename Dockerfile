
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y curl ca-certificates openssh-server && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /run/sshd

RUN echo 'root:docker' | chpasswd

RUN sed -i \
    -e 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' \
    -e 's/#PasswordAuthentication yes/PasswordAuthentication yes/' \
    /etc/ssh/sshd_config

RUN curl -fsSL https://sshx.io/get | sh

EXPOSE 22

CMD ["bash", "-c", "ssh-keygen -A && /usr/sbin/sshd && echo '========================================' && echo 'SSHX STARTING...' && echo '========================================' && exec sshx localhost:22"]

