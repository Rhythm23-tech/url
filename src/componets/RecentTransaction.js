import React from "react";
import { Card, Table } from "antd";



const columns = [
    {
        title: "Caller Address",
        dataIndex: "caller",
        key: "caller",
    },
    {
        title: "Function Name",
        dataIndex: "functionName",
        key: "functionName",
    },
    {
        title: "Input (Bytes32)",
        dataIndex: "Input",
        key: "Input",
        render: (hexString) => {
            // Ensure hexString is defined
            if (!hexString) {
                return "N/A"; // Or return ""; depending on your preference
            }

            // Parse the hexadecimal string to a decimal number
            const decimalNumber = parseInt(hexString, 16);

            // Optionally, format the decimal number as a string with commas for better readability
            const formattedDecimal = decimalNumber.toLocaleString();

            return formattedDecimal;
        }
    }];


function RecentTransaction({ transactionData }) {



    console.log("Received Transaction Data:", transactionData);
    return (
        <div className="transaction-container">
            <Card title="Recent Activity" style={{ width: "100%", minHeight: "663px" }}>
                {transactionData &&
                    <Table
                        dataSource={transactionData}
                        columns={columns}
                        pagination={{ position: ["bottomCenter"], pageSize: 8 }}
                    />
                }
            </Card>
        </div>
    );
}

export default RecentTransaction;