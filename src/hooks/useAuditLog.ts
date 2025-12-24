// Audit log stub - placeholder for future audit logging functionality
// The audit_logs table does not exist yet, so we provide a no-op implementation

interface AuditLogParams {
    tableName: string;
    recordId: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    changedFields?: string[];
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

export const logActionDirect = async (_params: AuditLogParams): Promise<boolean> => {
    // Stub - audit logging not implemented yet
    console.log("Audit log (stub):", _params);
    return true;
};

export const getAuditHistoryDirect = async (
    _tableName: string,
    _recordId: string
): Promise<unknown[]> => {
    // Stub - audit logging not implemented yet
    return [];
};

export const useAuditLog = () => {
    const logAction = async (
        _action: string,
        _table: string,
        _recordId: string,
        _oldValues?: unknown,
        _newValues?: unknown
    ): Promise<boolean> => {
        console.log("Audit log (stub):", { _action, _table, _recordId });
        return true;
    };

    const getAuditHistory = async (_tableName: string, _recordId: string): Promise<unknown[]> => {
        return [];
    };

    return { logAction, getAuditHistory };
};
