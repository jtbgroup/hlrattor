# 1. Vérifier si le conteneur tourne
docker ps | grep hlrattor

# 2. Voir TOUS les conteneurs (même arrêtés)
docker ps -a | grep hlrattor

# 3. Voir les LOGS (c'est là que sont les erreurs!)
docker compose -f docker-compose.dev.yml logs --tail=100

# 4. Vérifier les ports en écoute
netstat -tuln | grep -E "8080|8081|4200|5005"
# Ou avec ss (si netstat pas dispo):
ss -tuln | grep -E "8080|8081|4200|5005"

# 5. État de supervisord
docker compose -f docker-compose.dev.yml exec app supervisorctl status

# 6. Tester les endpoints
curl http://localhost:8080    # Nginx
curl http://localhost:4200    # Angular
curl http://localhost:8081/actuator/health  # Backend