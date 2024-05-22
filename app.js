document.addEventListener('DOMContentLoaded', () => {
    fetch('salaries.csv')
        .then(response => response.text())
        .then(data => {
            const rows = data.trim().split('\n').slice(1); // Remove any trailing whitespace and header row
            const yearData = {};
            const jobTitlesData = {};

            rows.forEach(row => {
                const columns = row.split(',');
                const year = columns[0]; // work_year
                const jobTitle = columns[4]; // job_title
                const salaryInUSD = parseFloat(columns[6]); // salary_in_usd

                if (!yearData[year]) {
                    yearData[year] = { totalJobs: 0, totalSalary: 0 };
                }

                if (!jobTitlesData[year]) {
                    jobTitlesData[year] = {};
                }

                if (!isNaN(salaryInUSD)) {
                    yearData[year].totalJobs += 1;
                    yearData[year].totalSalary += salaryInUSD;

                    if (!jobTitlesData[year][jobTitle]) {
                        jobTitlesData[year][jobTitle] = 0;
                    }
                    jobTitlesData[year][jobTitle] += 1;
                }
            });

            const tableBody = document.querySelector('#salary-table tbody');
            tableBody.innerHTML = ''; // Clear any existing rows

            for (const year in yearData) {
                const totalJobs = yearData[year].totalJobs;
                const averageSalary = totalJobs > 0 ? (yearData[year].totalSalary / totalJobs).toFixed(2) : 'NaN';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${year}</td>
                    <td>${totalJobs}</td>
                    <td>${averageSalary}</td>
                `;
                tr.addEventListener('click', () => displayJobTitles(year, jobTitlesData[year]));
                tableBody.appendChild(tr);
            }

            renderLineGraph(yearData);

            console.log(yearData); // Log the data structure to verify content
        })
        .catch(error => console.error('Error fetching the CSV file:', error));
});

function renderLineGraph(yearData) {
    const ctx = document.getElementById('line-chart').getContext('2d');
    const labels = Object.keys(yearData).sort();
    const data = {
        labels: labels,
        datasets: [{
            label: 'Total Jobs',
            data: labels.map(year => yearData[year].totalJobs),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function displayJobTitles(year, jobTitles) {
    const table = document.getElementById('job-titles-table');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = ''; // Clear any existing rows

    // Calculate the total jobs in the selected year
    let totalJobsInYear = 0;
    for (const title in jobTitles) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${title}</td>
            <td>${jobTitles[title]}</td>
        `;
        tbody.appendChild(tr);
        totalJobsInYear += jobTitles[title];
    }

    // Add a row to display the total jobs in the selected year
    const trTotalJobs = document.createElement('tr');
    trTotalJobs.innerHTML = `
        <td>Total Jobs in ${year}</td>
        <td>${totalJobsInYear}</td>
    `;
    tbody.appendChild(trTotalJobs);

    table.style.display = 'table';
}

function sortTable(columnIndex) {
    const table = document.getElementById('salary-table');
    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = Array.from(tbody.rows);

    const sortedRows = rows.sort((a, b) => {
        const aText = a.cells[columnIndex].innerText;
        const bText = b.cells[columnIndex].innerText;

        if (columnIndex === 0 || columnIndex === 1) {
            return parseInt(aText) - parseInt(bText);
        } else {
            return parseFloat(aText) - parseFloat(bText);
        }
    });

    tbody.innerHTML = '';
    sortedRows.forEach(row => tbody.appendChild(row));
}
