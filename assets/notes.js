(function () {

    // ── Page-level TOC: one entry per .notes-post ──
    const posts = document.querySelectorAll('.notes-post');
    const notesTocList = document.getElementById('notes-toc-list');

    if (notesTocList) {
        posts.forEach(function (post, i) {
            // Auto-assign id if missing
            if (!post.id) {
                const titleEl = post.querySelector('.post-title');
                const slug = titleEl
                    ? titleEl.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                    : 'post-' + (i + 1);
                post.id = 'post-' + slug;
            }

            const titleEl = post.querySelector('.post-title');
            const title = titleEl ? titleEl.textContent.trim() : 'Post ' + (i + 1);

            const num = String(i + 1).padStart(2, '0');

            const dateEl = post.querySelector('.post-date');
            const date = dateEl ? dateEl.textContent.trim() : '';

            const li = document.createElement('li');
            li.className = 'notes-toc-item';
            li.innerHTML =
                '<a href="#' + post.id + '" class="notes-toc-link">' +
                '<span class="notes-toc-num">' + num + '</span>' +
                '<span class="notes-toc-title">' + title + '</span>' +
                (date ? '<span class="notes-toc-date">' + date + '</span>' : '') +
                '</a>';
            notesTocList.appendChild(li);
        });
    }

    // ── Expand/collapse post content ──
    const LINE_HEIGHT_PX = 27; // ~1.7 × 16px
    const COLLAPSED_LINES = 30;
    const COLLAPSED_HEIGHT = LINE_HEIGHT_PX * COLLAPSED_LINES; // 810px

    document.querySelectorAll('.notes-post').forEach(function (post) {
        const content = post.querySelector('.reading-list') || post.querySelector('.post-content');
        if (!content) return;

        // Only collapse if content is taller than threshold
        if (content.scrollHeight <= COLLAPSED_HEIGHT) return;

        content.classList.add('post-collapsed');

        const btn = document.createElement('button');
        btn.className = 'post-expand-btn';
        btn.textContent = 'Expand';
        content.after(btn);

        btn.addEventListener('click', function () {
            const collapsed = content.classList.toggle('post-collapsed');
            btn.textContent = collapsed ? 'Expand' : 'Collapse';
        });
    });

    // ── Per-post TOC: one entry per .reading-item ──
    const items = document.querySelectorAll('.reading-item');
    const paperTocList = document.getElementById('toc-list');

    if (paperTocList) {
        items.forEach(function (item, i) {
            item.id = 'paper-' + (i + 1);

            const title = item.querySelector('h3').textContent.trim();
            const num = String(i + 1).padStart(2, '0');

            const li = document.createElement('li');
            li.className = 'post-toc-item';
            li.innerHTML =
                '<a href="#paper-' + (i + 1) + '" class="post-toc-link">' +
                '<span class="post-toc-num">' + num + '</span>' +
                '<span>' + title + '</span>' +
                '</a>';
            paperTocList.appendChild(li);
        });

        // Highlight active paper on scroll
        const paperLinks = paperTocList.querySelectorAll('.post-toc-link');
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    paperLinks.forEach(function (l) { l.classList.remove('active'); });
                    const active = paperTocList.querySelector('a[href="#' + entry.target.id + '"]');
                    if (active) active.classList.add('active');
                }
            });
        }, { rootMargin: '-20% 0px -70% 0px' });

        items.forEach(function (item) { observer.observe(item); });
    }

})();
