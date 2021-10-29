import { useEffect } from 'react'
import type { ChangeEvent } from 'react'
import type { editor } from 'monaco-editor'
import Editor, { useMonaco } from '@monaco-editor/react'
import { Box, Flex, Heading, Select } from '@chakra-ui/react'
import { editorOptions as sharedEditorOptions } from '../utils'
import type {
  ParserResult,
  TransformationOutput,
  TransformationResult,
} from '../swc'

function isTransformedCode(value: unknown): value is TransformationOutput {
  return typeof (value as TransformationOutput).code === 'string'
}

function stringifyOutput(output: TransformationResult | ParserResult): string {
  if (output.err) {
    return output.val
  } else if (isTransformedCode(output.val)) {
    return output.val.code
  } else {
    return JSON.stringify(output.val, null, 2)
  }
}

interface Props {
  output: TransformationResult | ParserResult
  viewMode: string
  onViewModeChange(viewMode: string): void
}

const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  ...sharedEditorOptions,
  readOnly: true,
  wordWrap: 'on',
  tabSize: 4, // this aligns with swc
}

export default function OutputEditor({
  output,
  viewMode,
  onViewModeChange,
}: Props) {
  const monaco = useMonaco()

  useEffect(() => {
    monaco?.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSyntaxValidation: true,
      noSemanticValidation: true,
      noSuggestionDiagnostics: true,
    })
  }, [monaco])

  const handleViewModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onViewModeChange(event.target.value)
  }

  const outputContent = stringifyOutput(output)
  const editorLanguage = output.err
    ? 'text'
    : viewMode === 'code'
    ? 'javascript'
    : 'json'

  return (
    <Flex direction="column" width="40vw" height="full">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="md" mb="8px">
          Output
        </Heading>
        <Flex alignItems="center">
          View:
          <Select
            size="xs"
            ml="1"
            bg="white"
            value={viewMode}
            onChange={handleViewModeChange}
          >
            <option value="code">Compiled Code</option>
            <option value="ast">AST</option>
          </Select>
        </Flex>
      </Flex>
      <Box height="full" borderColor="gray.400" borderWidth="1px">
        <Editor
          value={outputContent}
          language={editorLanguage}
          defaultLanguage="javascript"
          path={viewMode === 'code' ? 'output.js' : 'output.json'}
          options={editorOptions}
        />
      </Box>
    </Flex>
  )
}
