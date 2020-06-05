#!/bin/bash
docker system prune
docker build -t mea/node-web-app . --no-cache
docker run -it --mount type=bind,source="$(pwd)",target=/opt/node_app/app --rm --name eam_node  -p 3000:3000  mea/node-web-app 