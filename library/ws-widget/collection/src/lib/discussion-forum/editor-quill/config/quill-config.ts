export const quillBaseConfig = {
    formats: [
        'background',
        'bold',
        'color',
        'font',
        'code',
        'italic',
        'link',
        'size',
        'strike',
        'script',
        'underline',
        'blockquote',
        'header',
        'indent',
        'list',
        'align',
        'direction',
        'code-block',
        'mention',
      ],
    modules: {
      toolbar: [['blockquote', 'code-block'], ['bold', 'italic', 'underline', 'link']],
      history: {
        delay: 1500,
        userOnly: true,
      },
      syntax: false,
    },
    // placeholder: 'Ask a question, or add something you found helpful',
    theme: 'bubble',
  }
