/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/?redirect=portal#installation/NoNgNARATAdCMAYKQOwFYoEYCcbsu0wQSgQBYoQBmMs7ADhHuxBDLQRSioSqmQgBrAPbIEYYJjDip4mQF1UAMyJoUAYwjygA
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Alignment,
  AutoLink,
  Autosave,
  Bold,
  Essentials,
  FontColor,
  ImageEditing,
  ImageUtils,
  Link,
  List,
  ListProperties,
  Paragraph,
  TodoList,
  EventInfo,
} from "ckeditor5";

import translations from "ckeditor5/translations/ko.js";

import "ckeditor5/ckeditor5.css";

import "./TextEditor.css";

const LICENSE_KEY = import.meta.env.VITE_CKEDITOR_LICENSE_KEY;

interface CardTextEditorProps {
  setContent?: (content: string) => void;
}

export default function CardTextEditor(props: CardTextEditorProps) {
  const { setContent } = props;

  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // 내용 변경
  const handleContentChange = useCallback(
    (_: EventInfo, editor: ClassicEditor) => {
      if (!setContent) {
        return;
      }

      const newContent = editor.getData();
      setContent(newContent);
    },
    [setContent]
  );

  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  const { editorConfig } = useMemo(() => {
    if (!isLayoutReady) {
      return {};
    }

    return {
      editorConfig: {
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "bold",
            "fontColor",
            "|",
            "alignment",
            "bulletedList",
            "numberedList",
            "todoList",
            "|",
            "link",
          ],
          shouldNotGroupWhenFull: false,
        },
        plugins: [
          Alignment,
          AutoLink,
          Autosave,
          Bold,
          Essentials,
          FontColor,
          ImageEditing,
          ImageUtils,
          Link,
          List,
          ListProperties,
          Paragraph,
          TodoList,
        ],
        blockToolbar: [
          "fontSize",
          "fontColor",
          "fontBackgroundColor",
          "|",
          "bold",
          "italic",
          "|",
          "link",
          "insertImage",
          "insertTable",
          "|",
          "bulletedList",
          "numberedList",
          "outdent",
          "indent",
        ],
        language: "ko",
        licenseKey: LICENSE_KEY,
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: "https://",
          decorators: {
            toggleDownloadable: {
              mode: "manual" as const,
              label: "Downloadable",
              attributes: {
                download: "file",
              },
            },
          },
        },
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },
        placeholder: "내용을 입력해주세요.",
        translations: [translations],
      },
    };
  }, [isLayoutReady]);

  return (
    <div className="main-container">
      <div
        className="editor-container editor-container_classic-editor editor-container_include-block-toolbar"
        ref={editorContainerRef}
      >
        <div className="editor-container__editor">
          <div ref={editorRef}>
            {editorConfig && (
              <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                onBlur={handleContentChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
