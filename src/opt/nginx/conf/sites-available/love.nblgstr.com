# the IP(s) on which your node server is running. I chose port 3000.
upstream node_love_clock {
  server 127.0.0.1:3333;
}

# the nginx server instance
server {
    listen 80;
    server_name love.nblgstr.com;

    access_log /root/public/nblgstr.com/log/access.log;
    error_log /root/public/nblgstr.com/log/error.log;

    # pass the request to the node.js server with the correct headers and much more can be added, see nginx config options
    location / {
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $http_host;
      proxy_set_header X-NginX-Proxy true;

      proxy_pass http://node_love_clock/;
      proxy_redirect off;
    }
 }
