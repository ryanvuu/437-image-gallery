import { useActionState, useId, useState } from "react";

interface IUploadPage {
    authToken: string;
}

function readAsDataURL(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = (err) => reject(err);
    });
}

export function UploadPage(props: IUploadPage) {
    const [previewStr, setPreviewStr] = useState("");
    const fileInputId = useId();
    const imageTitleId = useId();

    function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const inputElement = e.target;

        if (!inputElement.files || inputElement.files.length === 0) {
            console.error("No file selected");
            return;
        }

        const fileObj = inputElement.files[0];

        readAsDataURL(fileObj)
            .then(fileStr => {
                setPreviewStr(fileStr);
            })
            .catch(error => {
                console.error("Unable to preview image upload:", error);
            });
    }

    const [result, submitAction, isPending] = useActionState(
        async (_previousState: unknown, formData: FormData) => {
            const inputFileName = formData.get("name");
            const inputFile = formData.get("image");

            if (!inputFileName || !inputFile) {
                return {
                    type: "error",
                    message: "Please upload an image and give it a name."
                };
            }

            try {
                console.log(`Sending formData: ${formData}`);
                const res = await fetch("/api/images", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${props.authToken}`
                    },
                    body: formData
                });

                if (res.ok) {
                    return {
                        type: "success",
                        message: "Successfully uploaded image!"
                    };
                }
                else {
                    return {
                        type: "error",
                        message: "Failed to upload image. Bad format."
                    }
                }
            }
            catch {
                return {
                    type: "error",
                    message: "Failed to upload image. Network error."
                };
            }
        },
        null
    );

    return (
        <>
            <h2>Upload</h2>
            <form action={submitAction}>
                <div>
                    <label htmlFor={fileInputId}>Choose image to upload: </label>
                    <input
                        id={fileInputId}
                        name="image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        required
                        onChange={handleFileSelected}
                        disabled={isPending}
                    />
                </div>
                <div>
                    <label htmlFor={imageTitleId}>
                        <span>Image title: </span>
                        <input id={imageTitleId} name="name" required disabled={isPending} />
                    </label>
                </div>

                <div> {/* Preview img element */}
                    <img style={{width: "20em", maxWidth: "100%"}} src={previewStr || undefined} alt="" />
                </div>

                <input type="submit" value="Confirm upload" disabled={isPending} />
                {result?.type === "success" && <p aria-live="polite" style={{color: "green"}}>{result.message}</p>}
                {result?.type === "error" && <p aria-live="polite" style={{color: "red"}}>{result.message}</p>}
            </form>
        </>
    );
}
