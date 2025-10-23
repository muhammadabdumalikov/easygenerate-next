# Coolify Deployment Guide

This guide explains how to deploy the EasyGenerate Next.js application using Coolify.

## Prerequisites

- Coolify instance running
- Git repository with your code
- Docker installed (for local testing)

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository contains:
- ✅ `Dockerfile` (already created)
- ✅ `.dockerignore` (already created)
- ✅ `next.config.ts` with standalone output (already configured)
- ✅ `package.json` with correct scripts (already configured)

### 2. Coolify Configuration

#### In Coolify Dashboard:

1. **Create New Application**
   - Click "New Application"
   - Choose "Git Repository"
   - Connect your Git repository

2. **Application Settings**
   - **Name**: `easygenerate-next`
   - **Repository**: Your Git repository URL
   - **Branch**: `main` (or your default branch)
   - **Build Pack**: `Dockerfile`
   - **Dockerfile Path**: `./Dockerfile`

3. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=4000
   NEXT_TELEMETRY_DISABLED=1
   ```

4. **Port Configuration**
   - **Internal Port**: `4000`
   - **External Port**: `4000` (or any available port)

5. **Domain Configuration**
   - Set up your custom domain (optional)
   - Enable HTTPS (recommended)

### 3. Build Configuration

The Dockerfile is optimized for:
- ✅ **Multi-stage build** for smaller image size
- ✅ **Standalone output** for faster startup
- ✅ **Security** with non-root user
- ✅ **Performance** with proper caching

### 4. Deployment Process

1. **Initial Deploy**
   - Coolify will clone your repository
   - Build the Docker image using the Dockerfile
   - Deploy the container
   - Set up networking and domain

2. **Automatic Deployments**
   - Enable auto-deploy on Git push
   - Coolify will rebuild and redeploy automatically

### 5. Monitoring & Logs

- **Application Logs**: Available in Coolify dashboard
- **Health Checks**: Built-in health monitoring
- **Metrics**: CPU, Memory, and Network usage

## Local Testing

Before deploying to Coolify, test locally:

```bash
# Build the Docker image
docker build -t easygenerate-next .

# Run the container
docker run -p 4000:4000 easygenerate-next

# Test the application
curl http://localhost:4000
```

## Production Optimizations

### Dockerfile Features:
- **Alpine Linux**: Smaller base image
- **Multi-stage build**: Optimized layers
- **Non-root user**: Security best practice
- **Standalone output**: Faster startup
- **Proper caching**: Efficient builds

### Next.js Optimizations:
- **Standalone output**: Self-contained application
- **Compression**: Gzip compression enabled
- **External packages**: ExcelJS properly configured
- **Image optimization**: Configured for production

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check Dockerfile syntax
   - Verify all dependencies in package.json
   - Check .dockerignore file

2. **Application Won't Start**
   - Verify PORT environment variable
   - Check application logs in Coolify
   - Ensure all required files are included

3. **Performance Issues**
   - Monitor resource usage in Coolify
   - Check for memory leaks
   - Optimize Docker image size

### Debug Commands:

```bash
# Check container logs
docker logs <container-id>

# Inspect container
docker inspect <container-id>

# Check running processes
docker exec -it <container-id> ps aux
```

## Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `PORT` | `4000` | Application port |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disable Next.js telemetry |

## Security Considerations

- ✅ Non-root user in container
- ✅ Minimal Alpine Linux base
- ✅ No unnecessary packages
- ✅ Proper file permissions
- ✅ Health checks enabled

## Performance Tips

1. **Enable CDN** for static assets
2. **Use Redis** for session storage (if needed)
3. **Monitor memory usage** in production
4. **Set up proper logging** for debugging
5. **Configure auto-scaling** based on traffic

## Support

For issues with:
- **Coolify**: Check Coolify documentation
- **Docker**: Review Docker logs
- **Next.js**: Check Next.js deployment guide
- **Application**: Review application logs in Coolify dashboard
