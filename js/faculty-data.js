// ===== FACULTY-DATA.JS - Data Fakultas dan Program Studi Universitas Udayana =====

const facultyData = {
    "Fakultas Ilmu Budaya": [
        "Antropologi Budaya",
        "Arkeologi",
        "Sastra Bali",
        "Sastra Indonesia",
        "Sastra Inggris",
        "Sastra Jepang"
    ],
    "Fakultas Kedokteran": [
        "Pendidikan Dokter",
        "Kedokteran Gigi",
        "Ilmu Kesehatan Masyarakat"
    ],
    "Fakultas Hukum": [
        "Ilmu Hukum"
    ],
    "Fakultas Teknik": [
        "Teknik Sipil",
        "Teknik Mesin",
        "Teknik Elektro"
    ],
    "Fakultas Pertanian": [
        "Agribisnis",
        "Agroekoteknologi"
    ],
    "Fakultas Ekonomi dan Bisnis": [
        "Akuntansi",
        "Manajemen"
    ],
    "Fakultas Peternakan": [
        "Peternakan"
    ],
    "Fakultas Matematika dan Ilmu Pengetahuan Alam": [
        "Biologi",
        "Kimia",
        "Fisika",
        "Matematika"
    ],
    "Fakultas Kedokteran Hewan": [
        "Kedokteran Hewan"
    ],
    "Fakultas Teknologi Pertanian": [
        "Teknologi Pangan",
        "Teknologi Industri Pertanian"
    ],
    "Fakultas Pariwisata": [
        "Pariwisata",
        "Destinasi Pariwisata",
        "Industri Perjalanan Wisata"
    ],
    "Fakultas Ilmu Sosial dan Ilmu Politik": [
        "Ilmu Politik",
        "Ilmu Komunikasi",
        "Hubungan Internasional",
        "Sosiologi"
    ],
    "Fakultas Kelautan dan Perikanan": [
        "Ilmu Kelautan",
        "Manajemen Sumberdaya Perairan"
    ]
};

// Function to populate faculty dropdown
function populateFacultyDropdown(selectElementId) {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) return;

    selectElement.innerHTML = '<option value="">Pilih Fakultas</option>';
    
    Object.keys(facultyData).forEach(faculty => {
        const option = document.createElement('option');
        option.value = faculty;
        option.textContent = faculty;
        selectElement.appendChild(option);
    });
}

// Function to populate study program dropdown based on selected faculty
function populateStudyProgramDropdown(faculty, selectElementId) {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) return;

    selectElement.innerHTML = '<option value="">Pilih Program Studi</option>';
    
    if (faculty && facultyData[faculty]) {
        facultyData[faculty].forEach(program => {
            const option = document.createElement('option');
            option.value = program;
            option.textContent = program;
            selectElement.appendChild(option);
        });
        selectElement.disabled = false;
    } else {
        selectElement.disabled = true;
    }
}

// Initialize faculty dropdowns when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Populate faculty dropdowns
    populateFacultyDropdown('eventFaculty');
    
    // Add event listener for faculty change
    const facultySelect = document.getElementById('eventFaculty');
    if (facultySelect) {
        facultySelect.addEventListener('change', (e) => {
            populateStudyProgramDropdown(e.target.value, 'eventStudyProgram');
        });
    }
});
