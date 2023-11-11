module.exports = {
  eleventyComputed: {
    layout: 'article',
    permalink: (data) => `/articles/${data.page.fileSlug}/`,
  },
  tags: ['articles'],
};
