import React from "react";
import { useClient } from "./ClientProvider";
import { Button, Flex, Form, Input, Modal } from "antd";
import { invariant } from "./client/utils";

export function Settings() {
  type FieldType = {
    password: string;
    confirmPassword: string;
  };
  const [form] = Form.useForm<FieldType>();
  const [isBackupModalOpen, setIsBackupModalOpen] = React.useState(false);
  const client = useClient();
  const [processing, setProcessing] = React.useState(false);


  return (
    <Flex vertical>
      <Button
        type="default"
        onClick={() => {
          setIsBackupModalOpen(true);
        }}>
        Download password protected backup
      </Button>
      <Modal
        open={isBackupModalOpen}
        okButtonProps={{ htmlType: 'submit' }}
        confirmLoading={processing}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsBackupModalOpen(false);
          setProcessing(false);
          form.resetFields();
        }}>
        <Form
          disabled={processing}
          onFinish={async (values) => {
            invariant(values.password === values.confirmPassword, "Passwords do not match");
            setProcessing(true);
            console.log('values', values);

            const backup = await client.makeBackup(values.password);
            const thumbprint = client.thumbprint;

            const blob = new Blob([backup], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `grid-${thumbprint}.jws.txt`;
            a.click();
            setIsBackupModalOpen(false);
          }}
          onKeyDown={(e) => {
            // Submit on enter
            if (e.key === 'Enter') {
              form.submit();
            }
          }}
          form={form}>
          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password autoFocus disabled={processing} />
          </Form.Item>

          <Form.Item<FieldType>
            label="Confirm password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              {
                required: true,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The new password that you entered do not match!'));
                },
              }),
            ]}>
            <Input.Password disabled={processing} />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}