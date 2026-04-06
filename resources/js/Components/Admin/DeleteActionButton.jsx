import { DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Tooltip } from 'antd';

export default function DeleteActionButton({
    title = 'Delete this item?',
    description,
    onConfirm,
    tooltip = 'Delete',
    okText = 'Delete',
    buttonText,
    buttonType = 'default',
    buttonSize = 'small',
    buttonProps = {},
}) {
    return (
        <Popconfirm
            title={title}
            description={description}
            onConfirm={onConfirm}
            okText={okText}
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
        >
            <Tooltip title={tooltip}>
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    type={buttonType}
                    size={buttonSize}
                    {...buttonProps}
                >
                    {buttonText}
                </Button>
            </Tooltip>
        </Popconfirm>
    );
}
