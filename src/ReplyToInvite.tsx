import React from "react";
import { Button, Flex, Form, FormProps, Input, Typography } from "antd";
import { Client } from "./client";
import { parseJWS } from "./client/utils";
import { Invitation, SignedInvitation } from "./client/types";
import { DisplayInvite } from "./DisplayInvite";
import TextArea from "antd/es/input/TextArea";

export function ReplyToInvite({ client }: { client: Client; }): React.ReactNode {
  const [form] = Form.useForm<FieldType>();
  type FieldType = {
    invitationString?: SignedInvitation;
    nickname?: string;
    message?: string;
  };
  const nickname = Form.useWatch('nickname', form);
  const message = Form.useWatch('message', form);
  const invitationString = Form.useWatch('invitationString', form);
  const [invitation, setInvitation] = React.useState<Invitation | null>(null);
  React.useMemo(() => {
    if (invitationString) {
      parseJWS<Invitation>(invitationString).catch(() => {
        // Ignore parsing errors and reset the object
        return null;
      }).then(setInvitation);
    }
  }, [invitationString]);

  const [reply, setReply] = React.useState<string | null>(null);
  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    const reply = await client.replyToInvitation(values.invitationString!, values.message!);
    setReply(reply);
  };
  return (

    <Flex
      vertical
      style={{
        padding: 24,
        margin: "auto",
        maxWidth: 800,
      }}
      gap="small">


      <Form
        form={form}
        name="reply-to-invite"
        labelCol={{ span: 8 }}
        disabled={reply != null}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{}}
        onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Invitation"
          name="invitationString"
          rules={[{ required: true, message: 'Please paste an invitation generated by Whisper Grid' }]}
        >
          <TextArea cols={600} rows={10} />
        </Form.Item>
        <Form.Item<FieldType>
          label="Nickname"
          name="nickname"
          rules={[{ required: true, message: 'What nickname would like to use in your conversation?' }]}
        >
          <Input disabled={invitation == null || reply != null} />
        </Form.Item>
        <Form.Item<FieldType>
          label="Message"
          name="message"
          rules={[{ required: true, message: 'What message would you like to encrypt?' }]}
        >
          <TextArea
            disabled={invitation == null || reply != null} />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Encrypt Message
          </Button>
        </Form.Item>
      </Form>

      <Typography.Text>
        {nickname || '(nickname)'}: {message || '(message)'}
      </Typography.Text>
      {reply && (
        <>
          <Typography.Text>
            Send this block of text to the person who sent you the invitation.
          </Typography.Text>
          <Typography.Text code copyable>
            {reply}
          </Typography.Text>
        </>
      )}

      {invitation && invitationString && (
        <DisplayInvite invitation={invitation} signedInvite={invitationString as SignedInvitation} />
      )}

    </Flex>
  );
}
