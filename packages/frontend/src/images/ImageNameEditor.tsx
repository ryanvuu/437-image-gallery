import { useState } from "react";

interface INameEditorProps {
  initialValue: string;
  imageId: string;
  onUpdateName: (imageId: string, newName: string) => void;
}

export function ImageNameEditor(props: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [input, setInput] = useState(props.initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitErr, setHasSubmitErr] = useState(false);

    async function handleSubmitPressed() {
        // TODO
        console.log(props.imageId);

        setIsSubmitting(true);
        // ${props.imageId}
        fetch(`/api/images`)
          .then(res => {
            if (res.ok) {
              return res.json();
            }
            setHasSubmitErr(true);
            throw new Error(`Failed to update image details ${res.status}`);
          })
          // response succeeded, but ignore response data
          .then(() => {
            console.log(`input is: ${input}`);
            props.onUpdateName(props.imageId, input);
            setIsEditingName(false);
            setHasSubmitErr(false);
          })
          .catch(() => {
            setHasSubmitErr(true);
          })
          .finally(() => {
            setIsSubmitting(false);
          })
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                {isSubmitting && <p>Working...</p>}
                {hasSubmitErr && <p>Error updating image name</p>}
                <label>
                    New Name <input value={input} disabled={isSubmitting} onChange={e => setInput(e.target.value)}/>
                </label>
                <button disabled={input.length === 0 || isSubmitting} onClick={handleSubmitPressed}>Submit</button>
                <button onClick={() => setIsEditingName(false)}>Cancel</button>
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={() => setIsEditingName(true)}>Edit name</button>
            </div>
        );
    }
}