import { EstimateEditor as BaseEstimateEditor } from "../../EstimateEditor";

type EstimateEditorProps = Parameters<typeof BaseEstimateEditor>[0] & {
  materials?: unknown[];
};

export function EstimateEditor({ materials: _materials, ...props }: EstimateEditorProps) {
  return <BaseEstimateEditor {...props} />;
}
