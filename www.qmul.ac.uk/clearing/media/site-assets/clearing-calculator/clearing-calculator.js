(function ($) {
    $(document).ready(function () {
        let tariffs = {
            "IB": (new Map())
                .set('7', 7)
                .set('6', 6)
                .set('5', 5)
                .set('4', 4)
                .set('3', 3)
                .set('2', 2)
                .set('1', 1),
            "BTEC": (new Map())
                .set('D*', 56)
                .set('D', 48)
                .set('M', 32)
                .set('P', 16)
        };

        const settings = {
            domain: 'https://www.ucas.com/'
        };

        const delay = (function () {
            let timer = [];
            return function (callback, ms, index) {
                let timerIndex = parseInt(index);
                timerIndex = timerIndex || 0;
                clearTimeout(timer[timerIndex]);
                timer[timerIndex] = setTimeout(callback, ms);
            };
        })();

        const courses = '.clearing-courses';
        const $courses = $(courses);

        // Courses mixItUp
        const mixer = mixitup(courses);

        // Debounced mixItUp filtering
        function mixerFilter(filter) {
            delay(function () {
                mixer.filter(filter);
            }, 200, 0);
        }

        // Debounced mixItUp sorting
        function mixerSort(sort) {
            delay(function () {
                mixer.sort(sort);
            }, 200, 1);
        }

        const $tabs = $('.tabs__tab');

        const $award = $('#award');

        const $gradeInputs = $('[name="grade[]"]');
        const $gradeSelectors = $('.grade-selector');

        const $pointsInputs = $('[name="points[]"]');

        const $searchInput = $('#clearing-course-search');
        const $searchSingleInput = $('#clearing-course-search-single');

        const $sortBy = $('.btn-sort-by');

        const $noSubmit = $('.no-submit').submit(function () {
            return false;
        });

        const $resetButton = $('#resetCalculator').click(function () {
            resetFilter();
            return false;
        });

        $('a[href^="#"]').click(function () {
            const href = $(this).attr('href');
            if (!((typeof href === 'string' || href instanceof String) && href.startsWith('#') && href.length > 1)) return;

            const $a = $(href);
            if ($a.length < 1) return;

            try {
                $(href).get(0).scrollIntoView({behavior: "smooth", block: "start"});
            } catch (e) {
                $(href).get(0).scrollIntoView(true);
            }

            return false;
        });

        function setCoursesNotification(id, matches) {
            const $notification = $('#' + id + '-search-notifications');
            console.log(id, matches, $notification);

            if ($notification.length !== 1) return;
            if (matches > 0) {
                $notification
                    .find('.notification')
                    .removeClass('notification--show')
                    .filter('.notification--search-advice')
                    .addClass('notification--show')
                    .find('.notification__content')
                    .removeClass('notification__content--show')
                    .filter('.notification__content--matches')
                    .addClass('notification__content--show')
                    .find('.matching-courses')
                    .text((matches === 1) ? '1 course' : matches + ' courses');
            } else if (matches === 0) {
                $notification
                    .find('.notification')
                    .removeClass('notification--show')
                    .filter('.notification--search-advice')
                    .addClass('notification--show')
                    .find('.notification__content')
                    .removeClass('notification__content--show')
                    .filter('.notification__content--no-matches')
                    .addClass('notification__content--show');
            } else {
                $notification
                    .find('.notification')
                    .removeClass('notification--show');
            }
        }

        async function getTariff(award) {
            return new Promise(function (resolve, reject) {
                (function waitForTariff() {
                    if (tariffs.hasOwnProperty(award) && tariffs[award] !== '') {
                        resolve(tariffs[award]);
                    } else if (!tariffs.hasOwnProperty(award)) {
                        tariffs[award] = '';
                        $.getJSON(settings.domain + "api/tariff/v1/view/" + award).then(function (data) {
                            tariffs[award] = ((obj) => {
                                let map = new Map();
                                for (let k of Object.keys(obj)) {
                                    map.set(k, obj[k]);
                                }
                                return map;
                            })(data);
                            resolve(tariffs[award]);
                        });
                    }

                    setTimeout(waitForTariff, 50);
                })();
            });
        }

        function loadTariffs() {
            $gradeInputs.filter('select').each(async function () {
                const $select = $(this);
                const award = $select.attr('data-award');

                if (!(typeof award === 'string' || award instanceof String)) return;

                const data = await getTariff(award);

                $select.find('option').not('[value=""]').remove();

                data.forEach((points, grade) => {
                    $('<option>').attr('value', points).text(grade).appendTo($select);
                });

            });
        }

        async function getGradesMeta(grades, award, limit) {
            const meta = {
                count: 0,
                total: 0,
                average: 0
            }

            limit = parseInt(limit);
            limit = (!isNaN(limit)) ? limit : -1;

            if (!((typeof grades === 'string' || grades instanceof String) && (typeof award === 'string' || award instanceof String))) {
                return meta;
            }

            const points = await getTariff(award);

            let grading = [];

            points.forEach((value, key) => {
                grading.push(key);
            });

            grading.sort(function (a, b) {
                return b.length - a.length;
            });

            while (grades.trim().length > 0) {
                let found = false;
                let grade = '';
                for (let i = 0; i < grading.length; i++) {
                    grade = grading[i];
                    if (!found && grading[i].length > 0 && grades.trim().indexOf(grading[i]) === 0 && limit !== 0) {
                        found = true;
                        grade = grading[i];

                        if (limit > 0) {
                            limit -= 1;
                        }

                        break;
                    }
                }

                if (!found) {
                    grades = grades.trim().substring(grade.length || 1);
                } else {
                    grades = grades.trim().substring(grade.length);
                    const value = parseFloat(points.get(grade));
                    meta.count++;
                    meta.total += (!isNaN(value)) ? value : 0;
                    meta.average = meta.total / meta.count;
                }
            }

            return meta;
        }

        function initCourses() {
            let counter = 0;

            $courses
                .find('.mix')
                .each(function () {
                    const $this = $(this);
                    $this.attr('data-entry-id', ++counter);

                    if (!$this.get(0).hasAttribute('data-entry-availability')) {
                        if ($this.find('.result-tag__closed').length === 1) {
                            $this.attr('data-entry-availability', -1);
                        } else if ($this.find('.result-tag__open').length === 1) {
                            $this.attr('data-entry-availability', 1);
                        } else {
                            $this.attr('data-entry-availability', 0);
                        }
                    }
                });

            $courses
                .find('.mix')
                .filter('.mix[data-grades]')
                .filter('.mix[data-award]')
                .each(async function () {
                    const $this = $(this);
                    const meta = await getGradesMeta($this.data('grades').toString(), $this.data('award'));
                    const meta3 = await getGradesMeta($this.data('grades').toString(), $this.data('award'), 3);
                    $this.attr('data-grades-count', meta.count);
                    $this.attr('data-grades-total', meta.total);
                    $this.attr('data-grades-average', meta.average);
                    $this.attr('data-grades-triple-count', meta3.count);
                    $this.attr('data-grades-triple-total', meta3.total);
                    $this.attr('data-grades-triple-average', meta3.average);
                });

            $courses
                .find('.mix')
                .filter('.mix[data-ib]')
                .filter('.mix[data-ib-grades]')
                .each(async function () {
                    const $this = $(this);
                    const ib = parseFloat($this.data('ib'));
                    const meta = await getGradesMeta($this.data('ib-grades').toString(), 'IB');
                    $this.attr('data-ib-grades-count', meta.count);
                    $this.attr('data-ib-grades-total', meta.total);
                    $this.attr('data-ib-grades-average', meta.average);
                    $this.attr('data-ib-grades-total-combined', meta.total + (isNaN(ib) ? 0 : ib));
                });


            $courses
                .find('.mix')
                .filter('.mix[data-btec-grades]')
                .each(async function () {
                    const $this = $(this);
                    const meta = await getGradesMeta($this.data('btec-grades').toString(), 'BTEC');
                    $this.attr('data-btec-grades-count', meta.count);
                    $this.attr('data-btec-grades-total', meta.total);
                    $this.attr('data-btec-grades-average', meta.average);
                });
        }

        function getActiveTab() {
            return $tabs.index($tabs.filter('.is-active').get(0));
        }

        function getAwardSelector() {
            return $award.find(':selected').attr('data-grade-selector') || '';
        }

        function showGradesSelector() {
            const id = $award.find(':selected').data('grade-selector') || '';
            const $selectors = $gradeSelectors;
            const $selector = $('#grade-selector--' + id);
            if ($selector.length === 1) {
                $selectors.not($selector);
            }
            $selectors.removeClass('grade-selector--show');
            $selector.addClass('grade-selector--show');
        }

        function getPointsByAwardSelector(selector, name) {
            let count = 0;
            let total = 0;
            let average = 0;

            $(`#grade-selector--${selector}`).each(function () {
                const $this = $(this);

                $this.find(`[name="${name}"]`).each(function () {
                    const points = parseFloat($(this).val());
                    if (!isNaN(points)) {
                        count++;
                        total += points;
                        average = total / count;
                    }
                });
            });

            return {
                count: count,
                total: total,
                average: average
            };
        }

        function getGradePointsByAwardSelector(selector) {
            return getPointsByAwardSelector(selector, 'grade[]');
        }

        function getIbPointsByAwardSelector(selector) {
            return getPointsByAwardSelector(selector, 'points[]');
        }

        function getCourses() {
            let entries = [];

            $courses
                .find('.mix')
                .each(function () {
                    const $this = $(this);
                    let entry = {};

                    entry['id'] = parseFloat($this.data('entry-id'));
                    entry['content'] = $this.text().replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
                    entry['data'] = {
                        ucas: {
                            tariff: {
                                grades: {
                                    text: $this.data('grades'),
                                    count: $this.data('grades-count'),
                                    total: $this.data('grades-total'),
                                    average: $this.data('grades-average')
                                }
                            }
                        },
                        ib: {
                            points: parseFloat($this.data('ib')),
                            grades: {
                                text: $this.data('ib-grades'),
                                count: $this.data('ib-grades-count'),
                                total: $this.data('ib-grades-total'),
                                average: $this.data('ib-grades-average')
                            }
                        },
                        btec: {
                            grades: {
                                text: $this.data('btec-grades'),
                                count: $this.data('btec-grades-count'),
                                total: $this.data('btec-grades-total'),
                                average: $this.data('btec-grades-average')
                            }
                        }
                    }
                    entries.push(entry);
                });
            return entries;
        }

        function filterCourses() {
            let showKeywordNotification = false;
            let showGradesNotification = false;

            let entries = getCourses();

            const terms = (getActiveTab() === 0 && $searchSingleInput.length === 1) ? $searchSingleInput.val().trim() : (($searchInput.length === 1) ? $searchInput.val().trim() : '');

            if (terms.length > 0) {
                showKeywordNotification = true;
                entries = fuzzball.extract(terms, entries, {
                    scorer: fuzzball.partial_token_similarity_sort_ratio,
                    processor: entry => entry.content,
                    cutoff: 50
                });

                const maxScore = Math.max.apply(Math, entries.map(x => x[1]));

                entries = entries.filter(x => (x[1] === 100 || x[1] === maxScore)).map(x => x[0]);
            }

            if (getActiveTab() === 0) {
                setCoursesNotification('keyword-single', (showKeywordNotification) ? entries.length : -1);
                setCoursesNotification('keyword', -1);
                setCoursesNotification('grades', -1);
            } else if (getActiveTab() !== 0) {
                const gradePoints = getGradePointsByAwardSelector(getAwardSelector());

                switch (getAwardSelector()) {
                    case 'a-levels':
                        showGradesNotification = gradePoints.count > 0;
                        entries = entries.filter(entry => ((entry.data.ucas.tariff.grades.total <= gradePoints.total && entry.data.ucas.tariff.grades.count > 0) || gradePoints.count === 0));
                        break;
                    case 'international-baccalaureate':
                        const ibPoints = getIbPointsByAwardSelector(getAwardSelector());
                        showGradesNotification = (gradePoints.count > 0 || ibPoints.count > 0);
                        entries = entries.filter(function (entry) {
                            return (((!isNaN(entry.data.ib.points) && entry.data.ib.points <= ibPoints.total && ibPoints.count > 0) || ibPoints.count === 0) && ((entry.data.ib.grades.total <= gradePoints.total && entry.data.ib.grades.count > 0) || gradePoints.count === 0));
                        });
                        break;
                    case 'btec':
                        showGradesNotification = gradePoints.count > 0;
                        entries = entries.filter(entry => ((entry.data.btec.grades.total <= gradePoints.total && entry.data.btec.grades.count > 0) || gradePoints.count === 0));
                        break;
                    default:
                    // No award selected.
                }

                setCoursesNotification('keyword-single', -1);
                setCoursesNotification('keyword', (showKeywordNotification) ? entries.length : -1);
                setCoursesNotification('grades', (showGradesNotification) ? entries.length : -1);
            }

            return entries;
        }

        function updateCourses(entries) {
            entries = entries.map(entry => entry.id);

            $courses
                .find('.mix')
                .removeClass('mix-match')
                .each(function () {
                    const $this = $(this);
                    const id = parseFloat($this.data('entry-id'));
                    if (entries.indexOf(id) !== -1) {
                        $this.addClass('mix-match');
                    }
                });

            mixerFilter('.mix-match');
        }

        function runFilter() {
            updateCourses(filterCourses());
        }

        function resetTerms() {
            $searchInput.val('').keyup();
        }

        function resetAward() {
            $award.each(function () {
                $(this).prop("selectedIndex", 0).change();
            });
        }

        function resetGrades() {
            $gradeInputs.each(function () {
                $(this).prop("selectedIndex", 0).change();
            });
        }

        function resetPoints() {
            $pointsInputs.each(function () {
                $(this).val('');
            });
        }

        function resetSort() {
            $sortBy.first().click();
        }

        function resetFilter() {
            resetTerms();
            resetAward();
            resetGrades();
            resetPoints();
            resetSort();
        }

        $tabs.find('> a').click(function () {
            runFilter();
        });

        $award.change(function () {
            showGradesSelector(getAwardSelector());
            runFilter();
        });

        $gradeInputs.change(function () {
            runFilter();
        });

        $pointsInputs.change(function () {
            runFilter();
        });

        $pointsInputs.keyup(function () {
            const $this = $(this);
            const type = $this.attr('type');
            const min = parseInt($this.attr('min'));
            const max = parseInt($this.attr('max'));
            const value = parseFloat($this.val());

            if (type && type.toLowerCase() === 'number') {
                if (!isNaN(value)) {
                    $this.val(Math.round(value));

                    if (!isNaN(min) && value < min) {
                        $this.val(min);
                    }

                    if (!isNaN(max) && value > max) {
                        $this.val(max);
                    }
                }
            }

            $this.change();
        });

        $searchInput.keyup(function () {
            runFilter();
        });

        $searchSingleInput.keyup(function () {
            runFilter();
        });

        $sortBy.click(function () {
            const $this = $(this);
            $sortBy.not($this).removeClass('btn-sort-by--active');
            $this.addClass('btn-sort-by--active');
            if ($this.hasClass('btn-sort-by--course-title')) {
                mixerSort('course-title:asc');
            } else if ($this.hasClass('btn-sort-by--required-grades')) {
                switch (getAwardSelector()) {
                    case "international-baccalaureate":
                        mixerSort('ib-grades-total-combined:desc');
                        break;
                    default:
                        mixerSort('grades-triple-total:desc grades-triple-count:desc');
                }

            } else if ($this.hasClass('btn-sort-by--default')) {
                mixerSort('entry-availability:desc');
            }
            return false;
        });

        (async () => {
            loadTariffs();
            initCourses();
            runFilter();
            resetSort();
        })();

    });
})(jQuery);