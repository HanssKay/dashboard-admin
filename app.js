// Inisialisasi variabel dengan localStorage atau nilai default
let posts = JSON.parse(localStorage.getItem("posts")) || [];
let totalVisitors = JSON.parse(localStorage.getItem("totalVisitors")) || 0;
let totalComments = JSON.parse(localStorage.getItem("totalComments")) || 0;
let monthlyStats = JSON.parse(localStorage.getItem("monthlyStats")) || Array(12).fill({ visits: 0, comments: 0 });

// Perbarui total kunjungan setiap kali halaman dimuat
totalVisitors++;
localStorage.setItem("totalVisitors", JSON.stringify(totalVisitors));

// Fungsi utama untuk memperbarui tampilan
try {
    updateCounts();
    displayPosts();
} catch (error) {
    console.error("Error saat memuat data awal:", error);
}

// Fungsi untuk menambahkan post baru
function addPost() {
    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;

    if (title && content) {
        const newPost = {
            id: Date.now(),
            title,
            content,
            comments: []
        };

        posts.push(newPost);
        localStorage.setItem("posts", JSON.stringify(posts));
        updateCounts();
        displayPosts();

        // Kosongkan input setelah post berhasil ditambahkan
        document.getElementById("postTitle").value = '';
        document.getElementById("postContent").value = '';
    } else {
        console.warn("Judul dan isi post harus diisi!");
    }
}

// Fungsi untuk menampilkan daftar post
function displayPosts() {
    const postContainer = document.getElementById("postContainer");
    postContainer.innerHTML = ""; // Kosongkan sebelum mengisi ulang

    posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.classList = "bg-white p-4 rounded shadow";

        postElement.innerHTML = `
            <h3 class="text-lg font-bold">${post.title}</h3>
            <p>${post.content}</p>
            <div class="mt-3">
                <input type="text" placeholder="Tambah Komentar" id="comment-${post.id}" class="border p-1 w-full mb-1">
                <button onclick="addComment(${post.id})" class="bg-green-500 text-white p-1 rounded">Tambah Komentar</button>
            </div>
            <div class="mt-3 space-y-2" id="comments-${post.id}">
                ${post.comments.map(comment => `<p class="text-gray-700">${comment}</p>`).join("")}
            </div>
        `;

        postContainer.appendChild(postElement);
    });
}

// Fungsi untuk menambahkan komentar pada post tertentu
function addComment(postId) {
    const commentInput = document.getElementById(`comment-${postId}`);
    const commentText = commentInput.value;

    if (commentText) {
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.comments.push(commentText);
            totalComments++;
            monthlyStats[new Date().getMonth()].comments++;

            localStorage.setItem("posts", JSON.stringify(posts));
            localStorage.setItem("totalComments", JSON.stringify(totalComments));
            localStorage.setItem("monthlyStats", JSON.stringify(monthlyStats));
            updateCounts();
            displayPosts();
        } else {
            console.warn("Post dengan ID ini tidak ditemukan:", postId);
        }
    } else {
        console.warn("Isi komentar harus diisi!");
    }
}

// Fungsi untuk memperbarui total kunjungan dan komentar
function updateCounts() {
    document.getElementById("visitorCount").innerText = `Total Kunjungan: ${totalVisitors}`;
    document.getElementById("commentCount").innerText = `Total Komentar: ${totalComments}`;

    monthlyStats[new Date().getMonth()].visits++;
    localStorage.setItem("monthlyStats", JSON.stringify(monthlyStats));
    updateChart();
}

// Fungsi untuk menginisialisasi grafik
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: 'Kunjungan',
                data: monthlyStats.map(month => month.visits),
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 123, 255, 0.2)'
            },
            {
                label: 'Komentar',
                data: monthlyStats.map(month => month.comments),
                borderColor: 'green',
                backgroundColor: 'rgba(40, 167, 69, 0.2)'
            }
        ]
    },
    options: { responsive: true }
});

// Fungsi untuk memperbarui data pada grafik
function updateChart() {
    myChart.data.datasets[0].data = monthlyStats.map(month => month.visits);
    myChart.data.datasets[1].data = monthlyStats.map(month => month.comments);
    myChart.update();
}
