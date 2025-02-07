/**
 * @typedef {{
 *   urls: !Array<string>,
 *   keywords: !Array<string>
 * }} KeywordRecord
 *
 * @typedef {{
 *   keywords: !Array<!KeywordRecord>
 * }} KeywordModifiers
 */

/** @type {KeywordModifiers} */
const keywords = {
  keywords: [
    {
      keywords: ['componentDidMount', 'onMounted', 'ngOnInit'],
      urls: [
        '/docs/components/lifecycle/#connectedcallback',
        '/articles/lit-cheat-sheet/#connectedcallback'
      ]
    },
    {
      keywords: [
        'ngAfterViewInit',
        'afterFirstRender'
      ],
      urls: [
        '/docs/components/lifecycle/#firstupdated',
        '/articles/lit-cheat-sheet/#firstupdated'
      ]
    },
    {
      keywords: [
        'componentDidUpdate',
        'afterUpdate'
      ],
      urls: [
        '/docs/components/lifecycle/#updated',
        '/articles/lit-cheat-sheet/#updated'
      ]
    },
    {
      keywords: [
        'shouldComponentUpdate',
        'updateCheck'
      ],
      urls: [
        '/docs/components/lifecycle/#shouldupdate'
      ]
    },
    {
      keywords: [
        'componentWillUnmount',
        'onUnmounted',
        'ngOnDestroy'
      ],
      urls: [
        '/docs/components/lifecycle/#disconnectedcallback',
        '/articles/lit-cheat-sheet/#disconnectedcallback'
      ]
    },
    {
      keywords: [
        'renderToPipeableStream',
        'renderToReadableStream',
        'renderToStaticMarkup',
        'renderToString'
      ],
      urls: [
        '/docs/ssr/server-usage/#handling-renderresults'
      ]
    },
    {
      keywords: ['tsx'],
      urls: [
        '/docs/frameworks/react/#createcomponent',
        'https://www.youtube.com/watch?v=agBn1LW6dbM',
      ]
    },
    {
      keywords: ['exportparts'],
      urls: [
        'https://www.youtube.com/watch?v=Xt7blcyuw5s',
      ]
    }
  ]
};

/**
 * 11ty data JS loader.
 *
 * @returns {!KeywordModifiers} The keywords data for 11ty search index rendered in search-modifiers/keywords.
 */
module.exports = async () => {
  return keywords;
};