let currentLang = 'en';

const translations = {
    en: {
        'nav-header': '> navigation',
        'nav-whoami': '> whoami',
        'nav-about': '> about',
        'nav-skills': '> skills',
        'nav-certifications': '> certifications',
        'nav-projects': '> projects',
        'nav-paths': '> path',
        'nav-working': '> working on',
        'nav-milestones': '> milestones',
        'section-about': '> about',
        'section-skills': '> skills',
        'section-certifications': '> certifications',
        'section-projects': '> projects',
        'section-paths': '> path',
        'section-working': '> working on',
        'section-milestones': '> milestones'
    },
    pt: {
        'nav-header': '> navigation',
        'nav-whoami': '> whoami',
        'nav-about': '> sobre',
        'nav-skills': '> skills',
        'nav-certifications': '> certificações',
        'nav-projects': '> projetos',
        'nav-paths': '> percurso',
        'nav-working': '> no momento',
        'nav-milestones': '> conquistas',
        'section-about': '> sobre',
        'section-skills': '> skills',
        'section-certifications': '> certificações',
        'section-projects': '> projetos',
        'section-paths': '> percurso',
        'section-working': '> no momento',
        'section-milestones': '> conquistas'
    }
};

function escapeHtml(unsafe) {
    const div = document.createElement('div');
    div.textContent = unsafe;
    return div.innerHTML;
}

const statusElement = document.getElementById('status');
let welcomeMessages = [];
let currentMessageIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingTimeout;

async function loadWelcomeMessages() {
    try {
        const response = await fetch('welcomeMessages/welcomeMessages');
        const text = await response.text();
        welcomeMessages = text.split('\n').filter(line => line.trim());
        if (welcomeMessages.length > 0) {
            currentMessageIndex = Math.floor(Math.random() * welcomeMessages.length);
            setTimeout(() => typeWriter(), 300);
        }
    } catch (error) {
        welcomeMessages = ['I buged my welcome messages file!'];
        setTimeout(() => typeWriter(), 300);
    }
}

function typeWriter() {
    const baseText = '> We\'re connected | ';
    const currentMessage = welcomeMessages[currentMessageIndex];
    
    statusElement.textContent = '';
    
    const baseSpan = document.createTextNode(baseText);
    statusElement.appendChild(baseSpan);
    
    if (!isDeleting) {
        if (charIndex <= currentMessage.length) {
            const textNode = document.createTextNode(currentMessage.substring(0, charIndex));
            statusElement.appendChild(textNode);
            
            const cursor = document.createElement('span');
            cursor.className = 'cursor';
            cursor.textContent = '_';
            statusElement.appendChild(cursor);
            
            charIndex++;
            typingTimeout = setTimeout(typeWriter, 80 + Math.random() * 40);
        } else {
            const textNode = document.createTextNode(currentMessage);
            statusElement.appendChild(textNode);
            
            const cursor = document.createElement('span');
            cursor.className = 'cursor blink';
            cursor.textContent = '_';
            statusElement.appendChild(cursor);
            
            typingTimeout = setTimeout(() => {
                isDeleting = true;
                charIndex = currentMessage.length;
                typeWriter();
            }, 2500);
        }
    } else {
        if (charIndex > 0) {
            charIndex--;
            const textNode = document.createTextNode(currentMessage.substring(0, charIndex));
            statusElement.appendChild(textNode);
            
            const cursor = document.createElement('span');
            cursor.className = 'cursor';
            cursor.textContent = '_';
            statusElement.appendChild(cursor);
            
            typingTimeout = setTimeout(typeWriter, 50 + Math.random() * 30);
        } else {
            const cursor = document.createElement('span');
            cursor.className = 'cursor';
            cursor.textContent = '_';
            statusElement.appendChild(cursor);
            
            isDeleting = false;
            charIndex = 0;
            currentMessageIndex = Math.floor(Math.random() * welcomeMessages.length);
            typingTimeout = setTimeout(typeWriter, 800);
        }
    }
}

loadWelcomeMessages();

async function loadSkills(lang = 'en') {
    try {
        const response = await fetch(`skills/${lang}/skills`);
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        const skillsByCategory = {};
        const categories = new Set();
        
        lines.forEach(line => {
            const parts = line.split('_-_');
            if (parts.length === 3) {
                const category = parts[0].trim();
                const name = parts[1].trim();
                const level = parseInt(parts[2].trim());
                
                if (!skillsByCategory[category]) {
                    skillsByCategory[category] = [];
                }
                skillsByCategory[category].push({ name, level });
                categories.add(category);
            }
        });
        
        const allText = lang === 'en' ? 'all' : 'todos';
        const categoriesDiv = document.querySelector('.skill-categories');
        categoriesDiv.innerHTML = `<button class="category-btn active" data-category="all">> ${allText}</button>`;
        Array.from(categories).sort().forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.dataset.category = cat;
            btn.textContent = `> ${cat}`;
            categoriesDiv.appendChild(btn);
        });
        
        const skillsGrid = document.querySelector('.skills-grid');
        skillsGrid.innerHTML = '';
        
        Object.keys(skillsByCategory).sort().forEach(category => {
            skillsByCategory[category].forEach(skill => {
                const safeLevel = Math.max(0, Math.min(100, skill.level || 0));
                const item = document.createElement('div');
                item.className = 'skill-item';
                item.dataset.category = category;
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'skill-name';
                nameSpan.textContent = `> ${skill.name}`;
                
                const levelDiv = document.createElement('div');
                levelDiv.className = 'skill-level';
                const barDiv = document.createElement('div');
                barDiv.className = 'skill-bar';
                barDiv.style.width = `${safeLevel}%`;
                levelDiv.appendChild(barDiv);
                
                item.appendChild(nameSpan);
                item.appendChild(levelDiv);
                skillsGrid.appendChild(item);
            });
        });
        
        setTimeout(() => setupSkillFilters(), 0);
    } catch (error) {
    }
}

function setupSkillFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const skillItems = document.querySelectorAll('.skill-item');
    const skillsGrid = document.querySelector('.skills-grid');
    const showMoreContainer = document.querySelector('.show-more-container');
    const showMoreBtn = document.getElementById('show-more-btn');
    let isExpanded = false;

    function updateShowMoreButton(category) {
        if (category === 'all') {
            const visibleCount = Array.from(skillItems).filter(item => !item.classList.contains('hidden')).length;
            if (visibleCount > 16) {
                showMoreContainer.style.display = 'block';
                if (!isExpanded) {
                    skillsGrid.classList.add('collapsed');
                }
            } else {
                showMoreContainer.style.display = 'none';
                skillsGrid.classList.remove('collapsed');
            }
        } else {
            showMoreContainer.style.display = 'none';
            skillsGrid.classList.remove('collapsed');
            isExpanded = false;
        }
    }

    function updateButtonText() {
        const lang = currentLang;
        if (isExpanded) {
            showMoreBtn.textContent = lang === 'en' ? '> show less' : '> mostrar menos';
        } else {
            showMoreBtn.textContent = lang === 'en' ? '> show more' : '> mostrar mais';
        }
    }

    updateButtonText();
    updateShowMoreButton('all');

    showMoreBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        if (isExpanded) {
            skillsGrid.classList.remove('collapsed');
        } else {
            skillsGrid.classList.add('collapsed');
            const skillsSection = document.getElementById('skills');
            skillsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        updateButtonText();
    });

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            isExpanded = false;
            
            skillItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';
            });
            
            setTimeout(() => {
                skillItems.forEach(item => {
                    if (category === 'all' || item.dataset.category === category) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
                
                updateShowMoreButton(category);
                updateButtonText();
                
                let visibleIndex = 0;
                skillItems.forEach(item => {
                    if (!item.classList.contains('hidden')) {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, visibleIndex * 20);
                        visibleIndex++;
                    }
                });
            }, 200);
        });
    });
}

loadSkills(currentLang);

const modal = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.modal-close');

async function loadCertificates(lang = 'en') {
    try {
        const response = await fetch(`certs/${lang}/certs`);
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        const certs = {};
        const certList = document.querySelector('.cert-list');
        certList.innerHTML = '';
        
        lines.forEach(line => {
            const parts = line.split('_-_');
            if (parts.length === 3 || parts.length === 4) {
                const id = parts[0].trim();
                const name = parts[1].trim();
                const file = parts[2].trim().replace(/[^a-zA-Z0-9._-]/g, '');
                let description = parts.length === 4 ? parts[3].trim() : '';
                
                if (description.length > 2000) {
                    description = description.substring(0, 2000);
                }
                
                if (!file || file.includes('..')) return;
                
                const certId = id.toLowerCase();
                certs[certId] = {
                    name: `${id} - ${name}`,
                    file: `certs/${file}`,
                    description: description
                };
                
                const certDiv = document.createElement('div');
                certDiv.className = 'cert-item cert-clickable';
                certDiv.dataset.cert = certId;
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'cert-name';
                nameSpan.textContent = `> ${id} - ${name}`;
                
                const hintSpan = document.createElement('span');
                hintSpan.className = 'cert-hint';
                hintSpan.textContent = 'click to view';
                
                const certImg = document.createElement('img');
                certImg.className = 'cert-icon';
                certImg.src = `assets/${file.replace('.pdf', '.png')}`;
                certImg.alt = '';
                certImg.onerror = function() { this.style.display = 'none'; };
                
                certDiv.appendChild(nameSpan);
                certDiv.appendChild(hintSpan);
                certDiv.appendChild(certImg);
                certList.appendChild(certDiv);
            }
        });
        
        document.querySelectorAll('.cert-clickable').forEach(cert => {
            cert.addEventListener('click', () => {
                const certId = cert.dataset.cert;
                const data = certs[certId];
                
                if (data) {
                    const modalContent = document.createElement('div');
                    
                    const title = document.createElement('div');
                    title.className = 'modal-title';
                    title.textContent = data.name;
                    
                    if (data.description) {
                        const desc = document.createElement('div');
                        desc.className = 'modal-description';
                        desc.textContent = data.description;
                        modalContent.appendChild(title);
                        modalContent.appendChild(desc);
                    } else {
                        modalContent.appendChild(title);
                    }
                    
                    const embed = document.createElement('embed');
                    embed.className = 'modal-embed';
                    embed.src = data.file;
                    embed.type = 'application/pdf';
                    
                    modalContent.appendChild(embed);
                    modalBody.innerHTML = '';
                    modalBody.appendChild(modalContent);
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    } catch (error) {
    }
}

loadCertificates(currentLang);

function openModal(content) {
    modalBody.innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

let allRepos = [];
let currentSort = 'stars';
let contributedRepos = new Set();

async function loadContributedRepos() {
    try {
        const response = await fetch('gitContributions/repos');
        const text = await response.text();
        const urls = text.split('\n').filter(line => line.trim());
        urls.forEach(url => {
            try {
                const urlObj = new URL(url);
                if (urlObj.hostname !== 'github.com') return;
                const match = url.match(/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9._-]+)/);
                if (match) {
                    contributedRepos.add(`${match[1]}/${match[2]}`);
                }
            } catch (e) {
            }
        });
    } catch (error) {
    }
}

async function fetchGitHubProjects() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '<div class="loading">> loading projects...</div>';
    
    try {
        await loadContributedRepos();
        
        const ownResponse = await fetch('https://api.github.com/users/0xadamastor/repos?per_page=100');
        if (!ownResponse.ok) throw new Error('Failed to fetch repositories');
        
        const ownRepos = await ownResponse.json();
        
        const contributedPromises = Array.from(contributedRepos).map(async repoName => {
            try {
                const res = await fetch(`https://api.github.com/repos/${repoName}`);
                if (res.ok) {
                    const repo = await res.json();
                    repo.isContributed = true;
                    return repo;
                }
            } catch (e) {
                return null;
            }
        });
        
        const contributedReposData = (await Promise.all(contributedPromises)).filter(r => r !== null);
        
        allRepos = [...ownRepos, ...contributedReposData];
        
        displayProjects();
        
    } catch (error) {
        container.innerHTML = '<div class="loading">> failed to load projects</div>';
    }
}

function displayProjects() {
    const container = document.getElementById('projects-container');
    
    if (allRepos.length === 0) {
        container.innerHTML = '<div class="loading">> no repositories found</div>';
        return;
    }
    
    let sortedRepos = [...allRepos];
    
    if (currentSort === 'stars') {
        sortedRepos.sort((a, b) => {
            if (b.stargazers_count !== a.stargazers_count) {
                return b.stargazers_count - a.stargazers_count;
            }
            return new Date(b.updated_at) - new Date(a.updated_at);
        });
    } else if (currentSort === 'recent') {
        sortedRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }
    
    const limit = currentSort === 'all' ? sortedRepos.length : 6;
    sortedRepos = sortedRepos.slice(0, limit);
    
    container.innerHTML = '';
    
    sortedRepos.forEach((repo, index) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.cursor = 'pointer';
        
        const name = document.createElement('div');
        name.className = 'project-name';
        name.textContent = `> ${repo.name}`;
        
        const desc = document.createElement('div');
        desc.className = 'project-desc';
        desc.textContent = repo.description || 'No description available';
        
        const thumbnail = document.createElement('img');
        thumbnail.className = 'project-thumbnail';
        thumbnail.src = `assets/projects/${repo.name}_icon.png`;
        thumbnail.alt = '';
        thumbnail.onerror = function() { 
            this.src = `assets/projects/${repo.name}_icon.gif`;
            this.onerror = function() {
                this.className = 'project-thumbnail-large';
                this.src = `assets/projects/${repo.name}.png`;
                this.onerror = function() {
                    this.src = `assets/projects/${repo.name}.gif`;
                    this.onerror = function() { this.style.display = 'none'; };
                };
            };
        };
        
        const meta = document.createElement('div');
        meta.className = 'project-meta';
        
        const stars = document.createElement('span');
        stars.textContent = `${repo.stargazers_count} stars`;
        
        const updated = document.createElement('span');
        const date = new Date(repo.updated_at);
        updated.textContent = `updated ${date.toLocaleDateString()}`;
        
        meta.appendChild(stars);
        meta.appendChild(updated);
        
        const link = document.createElement('a');
        let repoUrl = '#';
        try {
            const url = new URL(repo.html_url);
            if (url.hostname === 'github.com') {
                repoUrl = repo.html_url;
                link.href = repoUrl;
            } else {
                link.href = '#';
            }
        } catch (e) {
            link.href = '#';
        }
        link.target = '_blank';
        link.className = 'project-link';
        link.textContent = '> view on github';
        
        card.addEventListener('click', (e) => {
            if (e.target !== link && !link.contains(e.target)) {
                window.open(repoUrl, '_blank');
            }
        });
        
        card.appendChild(name);
        card.appendChild(desc);
        card.appendChild(thumbnail);
        card.appendChild(meta);
        card.appendChild(link);
        
        container.appendChild(card);
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentSort = btn.dataset.sort;
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        displayProjects();
    });
});

fetchGitHubProjects();

async function loadAbout(lang = 'en') {
    try {
        const response = await fetch(`about/${lang}/about`);
        const text = await response.text();
        const parts = text.split('_-_');
        
        if (parts.length === 2) {
            const aboutText = parts[0].trim();
            const focusItems = parts[1].trim().split('\n').filter(line => line.trim() !== '');
            
            const aboutParagraph = document.querySelector('.about-text');
            aboutParagraph.textContent = aboutText;
            
            const focusGrid = document.querySelector('.focus-grid');
            focusGrid.innerHTML = '';
            
            focusItems.forEach(item => {
                const div = document.createElement('div');
                div.className = 'focus-item';
                div.textContent = `> ${item.trim()}`;
                focusGrid.appendChild(div);
            });
        }
    } catch (error) {
    }
}

loadAbout(currentLang);

async function loadPath(lang = 'en') {
    try {
        const response = await fetch(`path/${lang}/path`);
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        const timeline = document.querySelector('.timeline');
        timeline.innerHTML = '';
        
        lines.forEach(line => {
            const parts = line.split('_-_');
            if (parts.length === 2) {
                const date = parts[0].trim();
                const desc = parts[1].trim();
                
                const item = document.createElement('div');
                item.className = 'timeline-item';
                
                const dateSpan = document.createElement('span');
                dateSpan.className = 'timeline-date';
                dateSpan.textContent = `> ${date}`;
                
                const descSpan = document.createElement('span');
                descSpan.className = 'timeline-desc';
                descSpan.textContent = desc;
                
                item.appendChild(dateSpan);
                item.appendChild(descSpan);
                timeline.appendChild(item);
            }
        });
    } catch (error) {
    }
}

loadPath(currentLang);

async function loadWorkingOn(lang = 'en') {
    try {
        const response = await fetch(`workingOn/${lang}/workingOn`);
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        const grid = document.querySelector('.current-grid');
        grid.innerHTML = '';
        
        lines.forEach(line => {
            const parts = line.split('_-_');
            if (parts.length === 2) {
                const label = parts[0].trim();
                const value = parts[1].trim();
                
                const item = document.createElement('div');
                item.className = 'current-item';
                
                const labelSpan = document.createElement('span');
                labelSpan.className = 'current-label';
                labelSpan.textContent = `> ${label}`;
                
                const valueSpan = document.createElement('span');
                valueSpan.className = 'current-value';
                valueSpan.textContent = value;
                
                item.appendChild(labelSpan);
                item.appendChild(valueSpan);
                grid.appendChild(item);
            }
        });
    } catch (error) {
    }
}

loadWorkingOn(currentLang);

const milestoneDataMap = new WeakMap();

async function loadMilestones(lang = 'en') {
    const grid = document.getElementById('milestones-grid');
    
    try {
        const response = await fetch(`milestones/${lang}/milestones`);
        const text = await response.text();
        const files = text.split('\n').filter(line => line.trim() !== '');
        
        const milestones = files.map(line => {
            if (line.length > 300) return null;
            
            const parts = line.split('_-_');
            if (parts.length < 2) return null;
            
            const caption = parts[0].trim();
            const dateAndExt = parts[1].trim();
            let description = parts.length === 3 ? parts[2].trim() : '';
            
            if (description.length > 2000) {
                description = description.substring(0, 2000);
            }
            
            const match = dateAndExt.match(/^(\d{1,2})-(\d{1,2})-(\d{4})\.(jpg|jpeg|png|gif|pdf)$/i);
            if (match) {
                const [_, day, month, year, ext] = match;
                const paddedMonth = month.padStart(2, '0');
                const paddedDay = day.padStart(2, '0');
                
                const safeFilename = `${caption}_-_${day}-${month}-${year}.${ext}`.replace(/[^a-zA-Z0-9._\-\s]/g, '');
                if (!safeFilename || safeFilename.includes('..')) return null;
                
                const safeCaption = caption.replace(/[^a-zA-Z0-9 _-]/g, '');
                
                return {
                    file: `milestones/${safeFilename}`,
                    caption: safeCaption,
                    description: description,
                    year: year,
                    date: `${paddedDay}-${paddedMonth}-${year}`,
                    sortDate: `${year}-${paddedMonth}-${paddedDay}`
                };
            }
            return null;
        }).filter(m => m !== null);
        
        if (milestones.length === 0) {
            grid.innerHTML = '<p style="color: #555; text-align: center;">no milestones yet</p>';
            return;
        }
        
        milestones.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));
        
        grid.innerHTML = '';
        
        milestones.forEach((milestone, index) => {
            const item = document.createElement('div');
            item.className = 'milestone-item';
            milestoneDataMap.set(item, milestone);
            
            const thumbnail = document.createElement('div');
            thumbnail.className = 'milestone-thumbnail';
            
            if (milestone.file.toLowerCase().endsWith('.pdf')) {
                const pdfIcon = document.createElement('div');
                pdfIcon.className = 'pdf-icon';
                pdfIcon.textContent = 'PDF';
                thumbnail.appendChild(pdfIcon);
            } else {
                const img = document.createElement('img');
                img.src = milestone.file;
                img.alt = milestone.caption;
                img.className = 'milestone-img';
                thumbnail.appendChild(img);
            }
            
            const info = document.createElement('div');
            info.className = 'milestone-info';
            
            const yearDiv = document.createElement('div');
            yearDiv.className = 'milestone-year';
            yearDiv.textContent = milestone.year;
            
            const captionDiv = document.createElement('div');
            captionDiv.className = 'milestone-caption';
            captionDiv.textContent = milestone.caption;
            
            info.appendChild(yearDiv);
            info.appendChild(captionDiv);
            item.appendChild(thumbnail);
            item.appendChild(info);
            grid.appendChild(item);
        });
        
        document.querySelectorAll('.milestone-item').forEach(item => {
            item.addEventListener('click', function() {
                openMilestoneModal(milestoneDataMap.get(this));
            });
        });
    } catch (error) {
        grid.innerHTML = '<p style="color: #555; text-align: center;">failed to load milestones</p>';
    }
}

function openMilestoneModal(milestone) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = '';
    
    const isPdf = milestone.file.toLowerCase().endsWith('.pdf');
    
    const title = document.createElement('div');
    title.className = 'modal-title';
    title.textContent = `> ${milestone.year} - ${milestone.caption}`;
    
    modalBody.appendChild(title);
    
    if (milestone.description) {
        const desc = document.createElement('div');
        desc.className = 'modal-description';
        desc.textContent = milestone.description;
        modalBody.appendChild(desc);
    }
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.maxWidth = '900px';
    
    if (isPdf) {
        const embed = document.createElement('embed');
        embed.src = milestone.file;
        embed.type = 'application/pdf';
        embed.style.width = '100%';
        embed.style.height = '600px';
        embed.style.border = '1px solid #333';
        wrapper.appendChild(embed);
    } else {
        const img = document.createElement('img');
        img.src = milestone.file;
        img.alt = milestone.caption;
        img.style.width = '100%';
        img.style.border = '1px solid #333';
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => window.open(milestone.file, '_blank'));
        wrapper.appendChild(img);
    }
    
    const dateStamp = document.createElement('div');
    dateStamp.className = 'milestone-date-stamp';
    dateStamp.textContent = milestone.date;
    wrapper.appendChild(dateStamp);
    
    modalBody.appendChild(wrapper);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

loadMilestones(currentLang);

document.querySelectorAll('.nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav a');

function highlightNavigation() {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 250)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        if (linkHref && linkHref.substring(1) === current) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightNavigation);
highlightNavigation();

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
        }
    });
}, observerOptions);

const revealElements = document.querySelectorAll('.section-title, .info-box, .focus-item, .skill-item, .cert-item, .project-card, .timeline-item, .current-item, .milestone-item');
revealElements.forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'pt' : 'en';
    
    const langToggle = document.getElementById('lang-toggle');
    if (currentLang === 'en') {
        langToggle.innerHTML = '<span class="lang-active">EN</span> / <span class="lang-inactive">PT</span>';
    } else {
        langToggle.innerHTML = '<span class="lang-inactive">EN</span> / <span class="lang-active">PT</span>';
    }
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            element.textContent = translations[currentLang][key];
        }
    });
    
    loadAbout(currentLang);
    loadSkills(currentLang);
    loadPath(currentLang);
    loadWorkingOn(currentLang);
    loadCertificates(currentLang);
    loadMilestones(currentLang);
}

const langToggleBtn = document.getElementById('lang-toggle');
if (langToggleBtn) {
    langToggleBtn.addEventListener('click', toggleLanguage);
}

const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const nav = document.getElementById('nav');

if (mobileMenuToggle && nav) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            nav.classList.remove('active');
        });
    });
    
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mobileMenuToggle.classList.remove('active');
            nav.classList.remove('active');
        }
    });
}