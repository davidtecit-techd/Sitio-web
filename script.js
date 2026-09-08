const projectList = document.querySelector('#project-list');
let projectHoverAvailableAt = 0;
const pageSections = [...document.querySelectorAll('main > section')];
let pageScrollLocked = false;

function renderProjects() {

    projectList.innerHTML = projects.map((project, index) => {

        const category = project.category || 'web';

        const categoryLabel =
            project.categoryLabel || 'DESARROLLO WEB';

                const date =
                        project.date || project.year || `${new Date().getFullYear()}`;

                const visual = project.videoUrl

                        ? `<div class="project-visual video-project">
                                <video src="${project.videoUrl}" poster="${project.poster || ''}" controls muted loop playsinline preload="metadata"></video>
                                <span class="visual-label">${date}</span>
                            </div>`

                        : project.imageUrl

            ? `<div class="project-visual image-project">
                <img src="${project.imageUrl}" alt="${project.name}">
                                <span class="visual-label">${date}</span>
              </div>`

            : `<div class="project-visual visual-${project.visual}">
                                <span class="visual-label">${date}</span>
                ${project.visualMarkup || ''}
              </div>`;

        return `
            <article
                class="project-card${project.featured ? ' project-featured' : ''} reveal"
                data-category="${category}"
                data-project-index="${index}"
                tabindex="-1"
            >
                ${visual}

                <div class="project-meta">
                    <div>
                        <span>${categoryLabel}</span>
                        <h3>${project.name}</h3>
                    </div>

                    <div class="project-controls" aria-label="Navegar proyectos">
                        <button class="project-previous" type="button" data-project-direction="previous" aria-label="Ver proyecto anterior">
                            <span aria-hidden="true">←</span>
                        </button>
                        <span class="project-counter">${String(index + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}</span>
                        <button class="project-next" type="button" data-project-direction="next" aria-label="Ver siguiente proyecto">
                            <span aria-hidden="true">→</span>
                        </button>
                    </div>
                </div>

                <div class="project-details">
                    <p>${project.description || ''}</p>
                    <dl>
                        <div><dt>Inconvenientes</dt><dd>${project.challenges || 'Por documentar'}</dd></div>
                        <div><dt>Aprendizajes</dt><dd>${project.learnings || 'Por documentar'}</dd></div>
                    </dl>
                    ${project.projectUrl && project.projectUrl !== '#' ? `<a class="project-link" href="${project.projectUrl}" target="_blank" rel="noopener">Visitar proyecto <span>↗</span></a>` : '<span class="project-link project-link-pending">URL pendiente de agregar</span>'}
                </div>
            </article>
        `;

    }).join('');

    projectList
        .querySelectorAll('.reveal')
        .forEach(element => revealObserver.observe(element));

    projectList
        .querySelectorAll('[data-project-direction]')
        .forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (Date.now() < projectHoverAvailableAt) {
                    return;
                }

                const card = button.closest('[data-project-index]');
                const currentIndex = Number(card.dataset.projectIndex);
                const direction = button.dataset.projectDirection === 'previous' ? -1 : 1;

                projectHoverAvailableAt = Date.now() + 700;
                showProject(currentIndex + direction);
            });

            button.addEventListener('click', () => {
                const card = button.closest('[data-project-index]');
                const currentIndex = Number(card.dataset.projectIndex);
                const direction = button.dataset.projectDirection === 'previous' ? -1 : 1;
                showProject(currentIndex + direction);
            });
        });

    projectList.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            return;
        }

        const activeCard = projectList.querySelector('.project-card.is-active');
        const currentIndex = Number(activeCard.dataset.projectIndex);
        const direction = event.key === 'ArrowLeft' ? -1 : 1;

        showProject(currentIndex + direction);
    });

    showProject(0, false);
}


function showProject(requestedIndex, shouldScroll = true) {

    const nextIndex = (requestedIndex + projects.length) % projects.length;
    const nextProject = projectList.querySelector(`[data-project-index="${nextIndex}"]`);

    if (!nextProject) {
        return;
    }

    projectList.querySelectorAll('.project-card').forEach(card => {
        card.classList.toggle('is-active', card === nextProject);
        card.setAttribute('aria-hidden', card === nextProject ? 'false' : 'true');
    });
    nextProject.classList.add('visible');

    if (shouldScroll) {
        nextProject.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    nextProject.classList.remove('project-focus', 'project-switch');

    requestAnimationFrame(() => {
        nextProject.classList.add('project-focus', 'project-switch');
    });
}


// MENÚ MÓVIL

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

menuToggle.addEventListener('click', () => {

    const open = nav.classList.toggle('open');

    menuToggle.setAttribute(
        'aria-expanded',
        open
    );

});


nav.querySelectorAll('a').forEach(link => {

    link.addEventListener('click', () => {

        nav.classList.remove('open');

        menuToggle.setAttribute(
            'aria-expanded',
            'false'
        );

    });

});


// ANIMACIONES

function rebuildSection(section) {

    section.classList.remove('visible');
    section.querySelectorAll('.reveal').forEach(element => {
        element.classList.remove('visible');
    });

    requestAnimationFrame(() => {
        section.classList.add('visible');

        section.querySelectorAll('.reveal').forEach((element, index) => {
            element.dataset.revealDelay = Math.min(index * 90, 480);
            element.style.setProperty(
                '--reveal-delay',
                `${element.dataset.revealDelay}ms`
            );
            element.style.animationDelay = `${element.dataset.revealDelay}ms`;
            element.classList.add('visible');
        });
    });
}


function getCurrentSectionIndex() {

    const viewportCenter = window.innerHeight / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    pageSections.forEach((section, index) => {
        const distance = Math.abs(
            section.getBoundingClientRect().top + section.offsetHeight / 2 - viewportCenter
        );

        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });

    return closestIndex;
}


function moveToSection(direction) {

    const currentIndex = getCurrentSectionIndex();
    const nextIndex = Math.max(
        0,
        Math.min(pageSections.length - 1, currentIndex + direction)
    );

    if (nextIndex === currentIndex) {
        return;
    }

    pageSections[nextIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    rebuildSection(pageSections[nextIndex]);
}


document.addEventListener('wheel', event => {

    if (
        pageScrollLocked ||
        event.ctrlKey ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
        return;
    }

    if (Math.abs(event.deltaY) < 12) {
        return;
    }

    event.preventDefault();
    pageScrollLocked = true;
    moveToSection(event.deltaY > 0 ? 1 : -1);

    window.setTimeout(() => {
        pageScrollLocked = false;
    }, 700);
}, { passive: false });

const revealObserver = new IntersectionObserver(
    entries => entries.forEach(entry => {

        if (entry.isIntersecting) {
            const hero = entry.target.closest('.hero');

            if (hero) {
                hero.classList.add('hero-ready');
            }

            if (entry.target.matches('.section')) {
                rebuildSection(entry.target);
            } else {
                entry.target.classList.add('visible');
            }
            entry.target.style.setProperty(
                '--reveal-delay',
                `${entry.target.dataset.revealDelay || 0}ms`
            );
        }

    }),
    {
        threshold: 0.12
    }
);


document
    .querySelectorAll('.reveal')
    .forEach((element, index) => {
        element.dataset.revealDelay = Math.min(index * 70, 420);
        revealObserver.observe(element);
    });


document
    .querySelectorAll('.section')
    .forEach(section => revealObserver.observe(section));


// FILTROS

document
    .querySelectorAll('.filter')
    .forEach(button => {

        button.addEventListener('click', () => {

            document
                .querySelector('.filter.active')
                .classList.remove('active');

            button.classList.add('active');

            const filter = button.dataset.filter;

            document
                .querySelectorAll('.project-card')
                .forEach(card => {

                    card.hidden =
                        filter !== 'all' &&
                        card.dataset.category !== filter;

                });

        });

    });


// INICIAR PROYECTOS

renderProjects();