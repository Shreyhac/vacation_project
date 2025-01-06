const analyzeButton = document.getElementById('analyzeButton');
const resumeUpload = document.getElementById('resumeUpload');
const resultsSection = document.getElementById('resultsSection');
const resultsDiv = document.getElementById('results');

const API_KEY = 'aff_a931d4974a52fac7605cb91f0d784a003f706c1e';
const API_URL = 'https://api.affinda.com/v2/resumes';


const categorizedSkills = {
    technical: [],
    soft: [],
    tools: [],
    languages: [],
    other: []
};

function categorizeSkills(skills = []) {
    
    Object.keys(categorizedSkills).forEach(key => {
        categorizedSkills[key] = [];
    });

    
    if (!Array.isArray(skills) || !skills.length) {
        return categorizedSkills;
    }

    skills.forEach(skill => {
        if (!skill || !skill.name) return;
        
        const skillName = skill.name.toLowerCase();
        let matched = false;

        if (skillName.match(/javascript|python|java|html|css|sql|react|node|aws/)) {
            categorizedSkills.technical.push(skill);
            matched = true;
        }
        if (skillName.match(/communication|leadership|teamwork|problem solving|management/)) {
            categorizedSkills.soft.push(skill);
            matched = true;
        }
        if (skillName.match(/git|jira|confluence|slack|office|adobe/)) {
            categorizedSkills.tools.push(skill);
            matched = true;
        }
        if (skillName.match(/english|spanish|french|german|chinese|japanese/)) {
            categorizedSkills.languages.push(skill);
            matched = true;
        }
        if (!matched) {
            categorizedSkills.other.push(skill);
        }
    });

    return categorizedSkills;
}

analyzeButton.addEventListener('click', async () => {
    const file = resumeUpload.files[0];

    if (!file) {
        alert('Please upload a resume first!');
        return;
    }

    
    analyzeButton.disabled = true;
    analyzeButton.textContent = 'Analyzing...';
    resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <p>Analyzing your resume...</p>
            <div style="width: 100%; height: 4px; background-color: #f0f0f0; border-radius: 2px; margin: 10px 0;">
                <div style="width: 0%; height: 100%; background-color: #4299e1; border-radius: 2px; transition: width 0.3s ease-in-out;"></div>
            </div>
        </div>
    `;
    resultsSection.style.display = 'block';

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !data.data) {
            throw new Error('Invalid response format from API');
        }

        displayResults(data);
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = `
            <div style="color: #e53e3e; padding: 20px; border: 1px solid #feb2b2; border-radius: 8px; background-color: #fff5f5; margin: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #c53030;">Error Occurred</h4>
                <p style="margin: 0 0 10px 0;">${error.message}</p>
                <p style="margin: 0;">Please check your API key and try again. If the issue persists, contact support.</p>
            </div>
        `;
    } finally {
        analyzeButton.disabled = false;
        analyzeButton.textContent = 'Analyze Resume';
    }
});

function displayResults(data) {
    const parsedData = data.data;
    const skills = parsedData.skills || [];
    const workExperience = parsedData.workExperience || [];
    const education = parsedData.education || [];

   
    const skillsByCategory = categorizeSkills(skills);

    const htmlContent = `
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2d3748; margin-bottom: 20px;">Resume Analysis Results</h2>
            
            
            <section style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
                <h3 style="color: #2d3748; margin-bottom: 15px;">Personal Information</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <p><strong>Name:</strong> ${parsedData.name?.raw || 'Not specified'}</p>
                    <p><strong>Email:</strong> ${parsedData.emails?.[0] || 'Not specified'}</p>
                    <p><strong>Phone:</strong> ${parsedData.phoneNumbers?.[0] || 'Not specified'}</p>
                    ${parsedData.location ? `<p><strong>Location:</strong> ${parsedData.location}</p>` : ''}
                </div>
            </section>

            
            <section style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
                <h3 style="color: #2d3748; margin-bottom: 15px;">Skills Analysis</h3>
                ${Object.entries(skillsByCategory)
                    .filter(([_, skills]) => skills.length > 0)
                    .map(([category, skills]) => `
                        <div style="margin-bottom: 15px;">
                            <h4 style="color: #4a5568; text-transform: capitalize; margin-bottom: 10px;">${category}</h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${skills.map(skill => `
                                    <span style="background: #ebf4ff; color: #4a5568; padding: 4px 10px; border-radius: 15px; font-size: 0.9em;">
                                        ${skill.name}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
            </section>

         
        </div>
    `;

    resultsDiv.innerHTML = htmlContent;
}