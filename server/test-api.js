// File này dùng để test API mà không cần Postman
async function testAuth() {
  const baseUrl = 'http://localhost:5000/api/auth';
  
  console.log("⏳ Đang thử Đăng ký tài khoản...");
  
  // 1. Test Đăng ký
  try {
    const registerRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test${Date.now()}@gmail.com`, // Email ngẫu nhiên để không bị trùng
        password: "123",
        fullName: "Người Dùng Test"
      })
    });
    const registerData = await registerRes.json();
    console.log("👉 Kết quả Đăng ký:", registerData);

    if (registerRes.status === 201) {
       // 2. Test Đăng nhập (chỉ chạy khi đăng ký thành công)
       console.log("\n⏳ Đang thử Đăng nhập lại...");
       const loginRes = await fetch(`${baseUrl}/login`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           email: registerData.user.email, // Dùng email vừa tạo
           password: "123"
         })
       });
       const loginData = await loginRes.json();
       console.log("👉 Kết quả Đăng nhập:", loginData);
       
       if (loginData.token) {
        console.log("\n✅ Đăng nhập thành công. Token:", loginData.token);
         
         // --- TEST THÊM CHI TIÊU MỚI ---
         console.log("\n⏳ Đang thử thêm khoản chi 'Ăn sáng'...");
         const expenseRes = await fetch('http://localhost:5000/api/expenses', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}` // Gửi kèm token
            },
            body: JSON.stringify({
                amount: 50000,
                categoryId: 1, // Giả sử ID 1 là "Ăn uống" (bạn vừa tạo trong Prisma Studio)
                note: "Bún bò Huế"
            })
         });
         const expenseData = await expenseRes.json();
         console.log("👉 Kết quả Thêm chi tiêu:", expenseData);
       }
    }
  } catch (err) {
    console.log("❌ Lỗi kết nối:", err);
  }
}

testAuth();