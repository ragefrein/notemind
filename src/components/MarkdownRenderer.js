'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function MarkdownRenderer({ content }) {
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
    img({ src, alt, ...props }) {
      return (
        <img 
          src={src} 
          alt={alt} 
          className="max-w-full h-auto rounded-lg my-4"
          loading="lazy"
          {...props}
        />
      )
    },
    a({ href, children, ...props }) {
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 underline"
          {...props}
        >
          {children}
        </a>
      )
    },
    blockquote({ children, ...props }) {
      return (
        <blockquote 
          className="border-l-4 border-purple-500 pl-4 my-4 italic text-gray-300"
          {...props}
        >
          {children}
        </blockquote>
      )
    }
  }

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}