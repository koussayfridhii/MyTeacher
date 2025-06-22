import React, { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { $getRoot, $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, FORMAT_TEXT_COMMAND } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Box, Button, HStack } from '@chakra-ui/react';

// Theme and Editor Nodes
const editorTheme = {
  // Basic theme properties, can be expanded
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
  },
  list: {
    ul: 'editor-list-ul',
    ol: 'editor-list-ol',
  },
  link: 'editor-link',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
  },
  code: 'editor-code',
};

const editorNodes = [
  HeadingNode, QuoteNode,
  TableCellNode, TableNode, TableRowNode,
  ListItemNode, ListNode,
  CodeHighlightNode, CodeNode,
  AutoLinkNode, LinkNode
];

// Placeholder component
function Placeholder() {
  return <Box className="editor-placeholder" position="absolute" top="15px" left="10px" color="gray.500" pointerEvents="none">Enter some rich text...</Box>;
}

// Toolbar Plugin
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const onClick = (format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  return (
    <HStack spacing={2} mb={2} borderBottomWidth="1px" pb={2}>
      <Button size="sm" onClick={() => onClick('bold')}>Bold</Button>
      <Button size="sm" onClick={() => onClick('italic')}>Italic</Button>
      <Button size="sm" onClick={() => onClick('underline')}>Underline</Button>
    </HStack>
  );
}

// HTML Conversion & Initial Value Plugin
function HtmlPlugin({ initialHtml, onChange }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialHtml && editor) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialHtml, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().select();
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            selection.insertNodes(nodes);
        } else { // Fallback if no selection or not range selection
            $getRoot().clear();
            $getRoot().append(...nodes);
        }
      });
    }
  }, [initialHtml, editor]);

  return (
    <OnChangePlugin onChange={(editorState) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null);
        onChange(htmlString);
      });
    }} />
  );
}


const LexicalEditor = ({ value, onChange }) => {
  const initialConfig = {
    namespace: 'MyLexicalEditor',
    theme: editorTheme,
    onError: (error) => {
      console.error(error);
    },
    nodes: editorNodes,
    editorState: null, // Will be set by HtmlPlugin if initialHtml is provided
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Box className="editor-container" position="relative" borderWidth="1px" borderRadius="md" p={2} bg="white" color="black">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" style={{ minHeight: '150px', outline: 'none' }} />}
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <HtmlPlugin initialHtml={value} onChange={onChange} />
      </Box>
    </LexicalComposer>
  );
};

export default LexicalEditor;
