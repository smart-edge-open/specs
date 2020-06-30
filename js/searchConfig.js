/* SPDX-License-Identifier: Apache-2.0
 * Copyright (c) 2020 Intel Corporation
 */

(function () {
    window.initializeSearch = function (currentDocVersion, searchInputSelector, searchContentSelector,
        searchResultsSelector, searchPaginationSelector) {
        if (!currentDocVersion || typeof (currentDocVersion) !== 'string') {
            throw new Error('Provide a version');
        }

        if (!searchInputSelector || typeof searchInputSelector !== 'string') {
            throw new Error('Provide a search input selector');
        }

        if (!searchContentSelector || typeof searchContentSelector !== 'string') {
            throw new Error('Provide a search content selector');
        }

        if (!searchResultsSelector || typeof searchResultsSelector !== 'string') {
            throw new Error('Provide a search results selector');
        }

        if (!searchPaginationSelector || typeof searchPaginationSelector !== 'string') {
            throw new Error('Provide a search pagination selector');
        }

        $(document).ready(function () {
            initializeInstantSearch(currentDocVersion, searchInputSelector, searchResultsSelector, searchPaginationSelector);
            initializePopover(searchContentSelector, searchInputSelector);
            hidePopoversOnClickOutside();
        });
    };

    function initializeInstantSearch(currentDocVersion, inputSelector, resultsSelector, paginationSelector) {
        var search = instantsearch({
            appId: 'KTK1L88VUK',
            apiKey: '2c09d111435e53368ced940058c3ce41',
            indexName: 'Jekyll_search',
            routing: false,
            searchParameters: {
                hitsPerPage: 10,
                /*facetsRefinements: {
                    version: [currentDocVersion]
                },
                facets: ['version'] */
            }
        });
        //alert (JSON.stringify(search));
        search.addWidget(instantsearch.widgets.searchBox({
            container: inputSelector,
            placeholder: 'Search in the documentation',
            autofocus: false,
            poweredBy: true
        }));
        search.addWidget(instantsearch.widgets.hits({
            container: resultsSelector,
            templates: {
                empty: 'No results',
                item(hit) { 
                 return   '<div class="search-item"><a href="/docs'+hit.path+'">'+hit.title+'</a></div>'
                }
            },
            transformData: {
                allItems: searchResults => {
                    return searchResults;
                } 
            }
        }));
        search.addWidget(instantsearch.widgets.pagination({
            container: paginationSelector,
            maxPages: 20,
            scrollTo: false
        }));
        search.start();
    }

    function initializePopover(searchContentSelector, searchInputSelector) {
        var content = $(searchContentSelector).children();
        $(searchInputSelector).popover({
            html: true,
            placement: 'bottom',
            viewport: { selector: ".container-fluid", padding: 10 },
            content: function () {
                return content;
            }
        });
    }

    function hidePopoversOnClickOutside() {
        $('body').on('click', function (e) {
            $('[data-toggle="popover"]').each(function () {
                if (!$(this).is(e.target)
                    && $(this).has(e.target).length === 0
                    && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            });
        });
    }
})();
