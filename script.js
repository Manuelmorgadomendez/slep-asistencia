// ===== APPLICATION STATE =====
let attendanceData = {};
let currentDate = new Date();

// ===== COURSE CONFIGURATION =====
const courses = [
    { id: '1-basico', name: '1° Básico', sections: ['A', 'B'] },
    { id: '2-basico', name: '2° Básico', sections: ['A', 'B'] },
    { id: '3-basico', name: '3° Básico', sections: ['A', 'B'] },
    { id: '4-basico', name: '4° Básico', sections: ['A', 'B'] },
    { id: '5-basico', name: '5° Básico', sections: ['A', 'B'] },
    { id: '6-basico', name: '6° Básico', sections: ['A', 'B'] },
    { id: '7-basico', name: '7° Básico', sections: ['A', 'B'] },
    { id: '8-basico', name: '8° Básico', sections: ['A', 'B'] },
    { id: '1-medio', name: '1° Medio', sections: ['A', 'B'] },
    { id: '2-medio', name: '2° Medio', sections: ['A', 'B'] },
    { id: '3-medio', name: '3° Medio', sections: ['A', 'B'] },
    { id: '4-medio', name: '4° Medio', sections: ['A', 'B'] }
];

// ===== UTILITY FUNCTIONS =====
function formatDate(date) {
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showStatusMessage(message, type = 'success') {
    const statusContainer = document.getElementById('status-messages');
    const statusElement = document.createElement('div');
    statusElement.className = `status-message ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'x-circle' : 'alert-circle';
    
    statusElement.innerHTML = `
        <i data-lucide="${icon}"></i>
        <span>${message}</span>
    `;
    
    statusContainer.appendChild(statusElement);
    lucide.createIcons();
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (statusElement.parentNode) {
            statusElement.parentNode.removeChild(statusElement);
        }
    }, 5000);
}

function updateDateDisplay() {
    const dateElement = document.getElementById('current-date');
    dateElement.textContent = formatDate(currentDate);
}

function loadSavedData() {
    const saved = localStorage.getItem('slep-del-pino-attendance');
    if (saved) {
        try {
            attendanceData = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading saved data:', e);
            attendanceData = {};
        }
    }
}

function saveData() {
    try {
        localStorage.setItem('slep-del-pino-attendance', JSON.stringify(attendanceData));
        showStatusMessage('Datos guardados correctamente', 'success');
    } catch (e) {
        console.error('Error saving data:', e);
        showStatusMessage('Error al guardar los datos', 'error');
    }
}

// ===== DOM GENERATION =====
function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.id = `course-${course.id}`;
    
    let sectionsHTML = '';
    course.sections.forEach(section => {
        sectionsHTML += `
            <div class="course-section">
                <div class="section-label">Sección ${section}</div>
                <div class="input-group">
                    <label class="input-label" for="${course.id}-${section}-asistentes">
                        Alumnos Asistentes
                    </label>
                    <div class="input-container">
                        <input 
                            type="number" 
                            id="${course.id}-${section}-asistentes"
                            class="input-field"
                            min="0"
                            placeholder="0"
                            data-course="${course.id}"
                            data-section="${section}"
                            data-type="asistentes"
                        >
                    </div>
                </div>
                <div class="input-group">
                    <label class="input-label" for="${course.id}-${section}-inasistentes">
                        Alumnos Inasistentes
                    </label>
                    <div class="input-container">
                        <input 
                            type="number" 
                            id="${course.id}-${section}-inasistentes"
                            class="input-field"
                            min="0"
                            placeholder="0"
                            data-course="${course.id}"
                            data-section="${section}"
                            data-type="inasistentes"
                        >
                    </div>
                </div>
            </div>
        `;
    });
    
    card.innerHTML = `
        <h3 class="course-title">${course.name}</h3>
        ${sectionsHTML}
    `;
    
    return card;
}

function generateCourses() {
    const grid = document.getElementById('courses-grid');
    courses.forEach(course => {
        const card = createCourseCard(course);
        grid.appendChild(card);
    });
}

function populateSavedData() {
    courses.forEach(course => {
        course.sections.forEach(section => {
            const asistentesInput = document.getElementById(`${course.id}-${section}-asistentes`);
            const inasistentesInput = document.getElementById(`${course.id}-${section}-inasistentes`);
            
            const key = `${course.id}-${section}`;
            if (attendanceData[key]) {
                if (asistentesInput) {
                    asistentesInput.value = attendanceData[key].asistentes || 0;
                }
                if (inasistentesInput) {
                    inasistentesInput.value = attendanceData[key].inasistentes || 0;
                }
            }
        });
    });
}

// ===== DATA MANAGEMENT =====
function collectData() {
    const inputs = document.querySelectorAll('.input-field');
    const newData = {};
    
    inputs.forEach(input => {
        const course = input.dataset.course;
        const section = input.dataset.section;
        const type = input.dataset.type;
        const value = parseInt(input.value) || 0;
        
        if (value < 0) {
            showStatusMessage(`Error: El valor para ${course} sección ${section} ${type} no puede ser negativo`, 'error');
            input.value = 0;
            return;
        }
        
        const key = `${course}-${section}`;
        if (!newData[key]) {
            newData[key] = { asistentes: 0, inasistentes: 0 };
        }
        
        newData[key][type] = value;
    });
    
    return newData;
}

function validateData(data) {
    let isValid = true;
    let totalAsistentes = 0;
    let totalInasistentes = 0;
    
    Object.keys(data).forEach(key => {
        const courseData = data[key];
        totalAsistentes += courseData.asistentes;
        totalInasistentes += courseData.inasistentes;
        
        // Check for unrealistic numbers (basic validation)
        if (courseData.asistentes > 50 || courseData.inasistentes > 50) {
            showStatusMessage(`Advertencia: Revisar valores para ${key.replace('-', ' ')} - parecen muy altos`, 'warning');
        }
    });
    
    if (totalAsistentes + totalInasistentes === 0) {
        showStatusMessage('Advertencia: No se han ingresado datos de asistencia', 'warning');
        isValid = false;
    }
    
    return isValid;
}

// ===== EXCEL EXPORT =====
function exportToExcel() {
    const data = collectData();
    
    if (!validateData(data)) {
        showStatusMessage('Por favor, revise los datos antes de exportar', 'error');
        return;
    }
    
    // Prepare data for Excel
    const excelData = [];
    
    // Header row
    excelData.push([
        'Fecha',
        'Curso',
        'Sección',
        'Alumnos Asistentes',
        'Alumnos Inasistentes',
        'Total',
        'Porcentaje Asistencia'
    ]);
    
    // Data rows
    courses.forEach(course => {
        course.sections.forEach(section => {
            const key = `${course.id}-${section}`;
            if (data[key]) {
                const courseData = data[key];
                const total = courseData.asistentes + courseData.inasistentes;
                const percentage = total > 0 ? 
                    ((courseData.asistentes / total) * 100).toFixed(1) + '%' : '0%';
                
                excelData.push([
                    currentDate.toLocaleDateString('es-ES'),
                    course.name,
                    section,
                    courseData.asistentes,
                    courseData.inasistentes,
                    total,
                    percentage
                ]);
            }
        });
    });
    
    // Summary row
    const totalAsistentes = Object.values(data).reduce((sum, course) => sum + course.asistentes, 0);
    const totalInasistentes = Object.values(data).reduce((sum, course) => sum + course.inasistentes, 0);
    const totalGeneral = totalAsistentes + totalInasistentes;
    const percentageGeneral = totalGeneral > 0 ? 
        ((totalAsistentes / totalGeneral) * 100).toFixed(1) + '%' : '0%';
    
    excelData.push([
        '',
        'RESUMEN TOTAL',
        '',
        totalAsistentes,
        totalInasistentes,
        totalGeneral,
        percentageGeneral
    ]);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Style the header row
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "EBF5FF" } },
            alignment: { horizontal: "center" }
        };
    }
    
    // Style the summary row
    const summaryRow = excelData.length - 1;
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: summaryRow, c: col });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "F8F9FA" } },
            alignment: { horizontal: "center" }
        };
    }
    
    // Set column widths
    ws['!cols'] = [
        { width: 12 }, // Fecha
        { width: 15 }, // Curso
        { width: 10 }, // Sección
        { width: 18 }, // Asistentes
        { width: 18 }, // Inasistentes
        { width: 10 }, // Total
        { width: 18 }  // Porcentaje
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, "Registro de Asistencia");
    
    // Generate filename
    const dateStr = currentDate.toISOString().split('T')[0];
    const filename = `Registro_Asistencia_SLEP_Del_Pino_${dateStr}.xlsx`;
    
    // Download file
    XLSX.writeFile(wb, filename);
    
    showStatusMessage(`Archivo Excel descargado: ${filename}`, 'success');
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Save button
    document.getElementById('save-btn').addEventListener('click', () => {
        attendanceData = collectData();
        saveData();
    });
    
    // Export button
    document.getElementById('export-btn').addEventListener('click', exportToExcel);
    
    // Real-time data collection on input change
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('input-field')) {
            // Prevent negative numbers
            if (parseInt(e.target.value) < 0) {
                e.target.value = 0;
            }
        }
    });
    
    // Handle Enter key to prevent form submission
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.classList.contains('input-field')) {
            e.preventDefault();
            // Move to next input
            const inputs = Array.from(document.querySelectorAll('.input-field'));
            const currentIndex = inputs.indexOf(e.target);
            if (currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus();
            }
        }
    });
}

// ===== INITIALIZATION =====
function init() {
    // Update date
    updateDateDisplay();
    
    // Load saved data
    loadSavedData();
    
    // Generate course cards
    generateCourses();
    
    // Populate with saved data
    populateSavedData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Show welcome message
    showStatusMessage('Sistema de Registro de Asistencia cargado correctamente', 'success');
}

// ===== START APPLICATION =====
document.addEventListener('DOMContentLoaded', init);

// ===== UTILITY FUNCTIONS FOR FUTURE ENHANCEMENTS =====
function clearAllData() {
    if (confirm('¿Está seguro de que desea borrar todos los datos? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('slep-del-pino-attendance');
        attendanceData = {};
        
        // Clear all inputs
        const inputs = document.querySelectorAll('.input-field');
        inputs.forEach(input => input.value = '');
        
        showStatusMessage('Todos los datos han sido borrados', 'success');
    }
}

function getTotalAttendance() {
    const data = attendanceData;
    let totalAsistentes = 0;
    let totalInasistentes = 0;
    
    Object.values(data).forEach(course => {
        totalAsistentes += course.asistentes;
        totalInasistentes += course.inasistentes;
    });
    
    return {
        asistentes: totalAsistentes,
        inasistentes: totalInasistentes,
        total: totalAsistentes + totalInasistentes,
        porcentaje: totalAsistentes + totalInasistentes > 0 ? 
            ((totalAsistentes / (totalAsistentes + totalInasistentes)) * 100).toFixed(1) : 0
    };
}