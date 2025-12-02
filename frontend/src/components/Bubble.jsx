

const Bubble = ({ message }) => {
    // const { content, role } = message
    const textPart = message.parts.find((part) => part.type === "text");
    const content =  textPart?.text ?? "";

    return (
        <div className={`bubble ${message.role}`}>{content}</div>
    )
}

export default Bubble;