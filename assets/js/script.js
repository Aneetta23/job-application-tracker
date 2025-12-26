document.addEventListener('DOMContentLoaded', function() {
    const jobForm = document.getElementById('jobForm');
    const jobList = document.getElementById('jobList');
    const searchInput = document.getElementById('searchInput');
    const filterStatus = document.getElementById('filterStatus');
    const exportBtn = document.getElementById('exportBtn');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    let editingIndex = -1;

    displayJobs();
    updateStats();

    // Add/Edit job
    jobForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const company = document.getElementById('company').value;
        const position = document.getElementById('position').value;
        const status = document.getElementById('status').value;
        const date = document.getElementById('date').value;
        const notes = document.getElementById('notes').value;

        const job = { company, position, status, date, notes };

        if (editingIndex >= 0) {
            jobs[editingIndex] = job;
            editingIndex = -1;
            submitBtn.textContent = 'Add Application';
            cancelBtn.style.display = 'none';
        } else {
            jobs.push(job);
        }

        localStorage.setItem('jobs', JSON.stringify(jobs));
        displayJobs();
        updateStats();
        jobForm.reset();
    });

    // Cancel edit
    cancelBtn.addEventListener('click', function() {
        editingIndex = -1;
        submitBtn.textContent = 'Add Application';
        cancelBtn.style.display = 'none';
        jobForm.reset();
    });

    // Search and filter
    searchInput.addEventListener('input', displayJobs);
    filterStatus.addEventListener('change', displayJobs);

    // Export to CSV
    exportBtn.addEventListener('click', function() {
        const csv = jobs.map(job => `${job.company},${job.position},${job.status},${job.date},${job.notes}`).join('\n');
        const blob = new Blob([`Company,Position,Status,Date,Notes\n${csv}`], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'job_applications.csv';
        a.click();
    });

    // Display jobs with search/filter
    function displayJobs() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilter = filterStatus.value;
        const filteredJobs = jobs.filter(job =>
            (job.company.toLowerCase().includes(searchTerm) ||
             job.position.toLowerCase().includes(searchTerm) ||
             job.status.toLowerCase().includes(searchTerm)) &&
            (!statusFilter || job.status === statusFilter)
        );

        jobList.innerHTML = '';
        filteredJobs.forEach((job, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${job.company}</td>
                <td>${job.position}</td>
                <td>${job.status}</td>
                <td>${job.date}</td>
                <td>${job.notes || ''}</td>
                <td>
                    <button onclick="editJob(${jobs.indexOf(job)})">Edit</button>
                    <button onclick="deleteJob(${jobs.indexOf(job)})">Delete</button>
                </td>
            `;
            jobList.appendChild(tr);
        });
    }

    // Edit job
    window.editJob = function(index) {
        const job = jobs[index];
        document.getElementById('company').value = job.company;
        document.getElementById('position').value = job.position;
        document.getElementById('status').value = job.status;
        document.getElementById('date').value = job.date;
        document.getElementById('notes').value = job.notes || '';
        editingIndex = index;
        submitBtn.textContent = 'Update Application';
        cancelBtn.style.display = 'inline-block';
    };

    // Delete job
    window.deleteJob = function(index) {
        jobs.splice(index, 1);
        localStorage.setItem('jobs', JSON.stringify(jobs));
        displayJobs();
        updateStats();
    };

    // Update stats
    function updateStats() {
        const total = jobs.length;
        const applied = jobs.filter(j => j.status === 'Applied').length;
        const interviewed = jobs.filter(j => j.status === 'Interviewed').length;
        const rejected = jobs.filter(j => j.status === 'Rejected').length;
        const offered = jobs.filter(j => j.status === 'Offered').length;

        document.getElementById('totalApps').textContent = total;
        document.getElementById('appliedCount').textContent = applied;
        document.getElementById('interviewedCount').textContent = interviewed;
        document.getElementById('rejectedCount').textContent = rejected;
        document.getElementById('offeredCount').textContent = offered;
    }
});