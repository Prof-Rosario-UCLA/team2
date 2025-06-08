I'll walk you through setting up TLS for internal communication using cert-manager. Here's the step-by-step process:

## 1. Install cert-manager

First, install cert-manager in your cluster:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

Wait for cert-manager pods to be ready:
```bash
kubectl get pods -n cert-manager
```

## 2. Create a Certificate Authority (CA) Issuer

Create a self-signed CA for internal certificates:

```yaml
# ca-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigned-issuer
spec:
  selfSigned: {}
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: my-selfsigned-ca
  namespace: cert-manager
spec:
  isCA: true
  commonName: my-selfsigned-ca
  secretName: root-secret
  privateKey:
    algorithm: ECDSA
    size: 256
  issuerRef:
    name: selfsigned-issuer
    kind: ClusterIssuer
    group: cert-manager.io
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: ca-issuer
spec:
  ca:
    secretName: root-secret
```

Apply it:
```bash
kubectl apply -f ca-issuer.yaml
```

## 3. Create TLS Certificate for Your Backend

```yaml
# backend-certificate.yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: restaurantapp-backend-tls
  namespace: default  # Replace with your namespace
spec:
  secretName: backend-tls-secret
  issuerRef:
    name: ca-issuer
    kind: ClusterIssuer
  dnsNames:
  - restaurantapp-backend
  - restaurantapp-backend.default.svc.cluster.local
  - localhost
  ipAddresses:
  - 127.0.0.1
```

Apply it:
```bash
kubectl apply -f backend-certificate.yaml
```

## 4. Update Your Backend Deployment

Modify your backend deployment to mount the TLS certificate and configure HTTPS:

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: restaurantapp-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: restaurantapp-backend
  template:
    metadata:
      labels:
        app: restaurantapp-backend
    spec:
      containers:
      - name: backend
        image: your-backend-image:tag
        ports:
        - containerPort: 8443  # HTTPS port
          name: https
        - containerPort: 8080  # HTTP port (optional, for health checks)
          name: http
        env:
        - name: TLS_CERT_PATH
          value: "/etc/certs/tls.crt"
        - name: TLS_KEY_PATH
          value: "/etc/certs/tls.key"
        - name: PORT_HTTPS
          value: "8443"
        volumeMounts:
        - name: tls-certs
          mountPath: /etc/certs
          readOnly: true
      volumes:
      - name: tls-certs
        secret:
          secretName: backend-tls-secret
```

## 5. Update Your Backend Code

Here's an example of how to configure HTTPS in different languages:

**Node.js/Express:**
```javascript
const fs = require('fs');
const https = require('https');
const express = require('express');

const app = express();

// Your existing routes here
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// HTTPS configuration
const options = {
  key: fs.readFileSync(process.env.TLS_KEY_PATH),
  cert: fs.readFileSync(process.env.TLS_CERT_PATH)
};

https.createServer(options, app).listen(8443, () => {
  console.log('HTTPS Server running on port 8443');
});
```

**Go:**
```go
package main

import (
    "log"
    "net/http"
    "os"
)

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte(`{"status":"healthy"}`))
    })

    certPath := os.Getenv("TLS_CERT_PATH")
    keyPath := os.Getenv("TLS_KEY_PATH")
    
    log.Println("Starting HTTPS server on :8443")
    log.Fatal(http.ListenAndServeTLS(":8443", certPath, keyPath, mux))
}
```

## 6. Update Your Service

Update your backend service to expose the HTTPS port:

```yaml
# backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: restaurantapp-backend
spec:
  selector:
    app: restaurantapp-backend
  ports:
  - name: https
    port: 8443
    targetPort: 8443
    protocol: TCP
  - name: http
    port: 8080
    targetPort: 8080
    protocol: TCP
  type: ClusterIP
```

## 7. Update Frontend to Use HTTPS

In your frontend application, change API calls to use HTTPS:

```javascript
// Instead of: http://restaurantapp-backend:8080/api/
// Use: https://restaurantapp-backend:8443/api/

const apiBaseUrl = 'https://restaurantapp-backend:8443/api';

// If using self-signed certificates, you might need to handle certificate validation
const https = require('https');
const agent = new https.Agent({
  rejectUnauthorized: false // Only for internal self-signed certs
});
```

## 8. Verify the Setup

Check that the certificate was created:
```bash
kubectl get certificates
kubectl describe certificate restaurantapp-backend-tls
```

Check the secret:
```bash
kubectl get secret backend-tls-secret
kubectl describe secret backend-tls-secret
```

Test the HTTPS endpoint:
```bash
kubectl port-forward svc/restaurantapp-backend 8443:8443
curl -k https://localhost:8443/api/health
```

## 9. Optional: Create Certificate for Redis

If you want to secure Redis communication too:

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: restaurantapp-redis-tls
  namespace: default
spec:
  secretName: redis-tls-secret
  issuerRef:
    name: ca-issuer
    kind: ClusterIssuer
  dnsNames:
  - restaurantapp-redis
  - restaurantapp-redis.default.svc.cluster.local
```

This setup will automatically renew certificates before they expire. The certificates will be valid for internal cluster communication and provide encryption for data in transit between your services.

Would you like me to help you adapt this configuration for your specific backend technology stack?