'use client';

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

type Transaction = {
    id: string;
    type: 'exchange' | 'purchase' | 'exchange_rejection';
    date: Date;
    op_amount: number;
    currency: string;
    amount: number;
    status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
}

interface TransactionHistoryProps {
    transactions: Transaction[];
    loading?: boolean;
}

const statusVariantMap = {
    pending: 'default',
    approved: 'secondary',
    processing: 'outline',
    completed: 'default',
    rejected: 'destructive',
} as const;

const statusTextMap = {
    pending: '保留中',
    approved: '承認済',
    processing: '処理中',
    completed: '完了',
    rejected: '却下',
};

const typeTextMap = {
    exchange: '換金',
    purchase: '購入',
    exchange_rejection: '換金却下',
}


export default function TransactionHistory({ transactions, loading }: TransactionHistoryProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>取引履歴</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2 text-muted-foreground">読み込み中...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>取引履歴</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">取引履歴はまだありません。</p>
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>取引履歴</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>日付</TableHead>
                            <TableHead>タイプ</TableHead>
                            <TableHead>ステータス</TableHead>
                            <TableHead className="text-right">OP額</TableHead>
                            <TableHead className="text-right">金額</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell>{tx.date.toLocaleDateString()}</TableCell>
                                <TableCell>{typeTextMap[tx.type]}</TableCell>
                                <TableCell>
                                     <Badge variant={statusVariantMap[tx.status]} className={cn(
                                         tx.status === 'completed' && 'bg-green-600 text-white',
                                         tx.status === 'pending' && 'bg-yellow-500 text-black'
                                     )}>
                                        {statusTextMap[tx.status]}
                                    </Badge>
                                </TableCell>
                                <TableCell className={cn("text-right font-medium", tx.type === 'purchase' ? 'text-green-600' : 'text-red-600')}>
                                    {tx.type === 'purchase' ? '+' : '-'}{tx.op_amount.toLocaleString()} OP
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {tx.amount.toLocaleString(undefined, {
                                         minimumFractionDigits: tx.currency === 'JPY' ? 0 : 2,
                                         maximumFractionDigits: tx.currency === 'JPY' ? 0 : 2,
                                    })} {tx.currency}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
