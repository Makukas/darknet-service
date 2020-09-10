FROM nvidia/cuda:10.1-cudnn7-devel-ubuntu18.04
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Vilnius
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apt-get update && apt-get install -y wget curl git build-essential tcl pkg-config
# get darknet weights
# RUN wget https://pjreddie.com/media/files/yolov3.weights
RUN curl -L -o prekes_9000.weights https://www.dropbox.com/s/s46mef78c0vnbx9/prekes_9000.weights?dl=1
RUN curl -L -o prekes.cfg https://www.dropbox.com/s/ayq8l85gjx3xdyz/prekes.cfg?dl=1
RUN curl -L -o obj.data https://www.dropbox.com/s/76rrxbr54872y75/obj.data?dl=1

RUN git clone https://github.com/AlexeyAB/darknet.git
WORKDIR /darknet
RUN sed -i 's/GPU=0/GPU=1/' Makefile
RUN sed -i 's/CUDNN=0/CUDNN=1/' Makefile
RUN make

# install node and use the lts version
RUN curl -L https://git.io/n-install | bash -s -- -y lts
COPY /server/* /darknet/
# install npm deps
RUN bash -c 'export N_PREFIX="$HOME/n"; [[ :$PATH: == *":$N_PREFIX/bin:"* ]] || PATH+=":$N_PREFIX/bin"; npm install'

EXPOSE 3000

ENTRYPOINT /root/n/bin/node server.js