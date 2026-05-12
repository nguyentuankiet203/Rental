BASE_URL="http://localhost:3001"
EMAIL="landlord@test.com"
PASSWORD="123456"
echo "👉 Login..."

TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" | jq -r '.access_token')

echo "TOKEN=$TOKEN"
echo "👉 Get rooms..."

curl -X GET http://localhost:3001/dashboard \
  -H "Authorization: Bearer $TOKEN"