import { Fragment } from "react";
import ModalWrapper from "@/app/_common/component/templates/Modal";
import SimpleOneButtonTemplate from "@/app/_common/component/templates/Modal/SimpleOneButtonTemplate";
import { HelpDescriptions } from "@/app/_common/types";
import { DefaultModalChildrenProps } from "@/app/_global/providers/ModalProvider/types";

interface DescriptionModalProps
  extends DefaultModalChildrenProps,
    HelpDescriptions {}

export default function DescriptionModal({
  title,
  content,
  summary,
  note,
  close,
}: DescriptionModalProps) {
  return (
    <ModalWrapper close={close} shouldDisplay opacity={50}>
      <SimpleOneButtonTemplate
        title={title}
        onClick={close}
        summary={summary}
        note={note}
      >
        {content
          .split("\n")
          .filter((line) => line !== "")
          .map((line, index, selfArray) => (
            <Fragment key={`description_line_${index}`}>
              <p>{line}</p>
              {index !== selfArray.length - 1 && <br />}
            </Fragment>
          ))}
      </SimpleOneButtonTemplate>
    </ModalWrapper>
  );
}
