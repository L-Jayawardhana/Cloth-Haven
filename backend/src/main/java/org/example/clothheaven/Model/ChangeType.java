package org.example.clothheaven.Model;

public enum ChangeType {
    ORDER,       // customer purchase
    RESTOCK,     // new items added
    CANCEL,      // canceled order -> stock back
    RETURN,      // returned items
    DAMAGE,      // defective/lost
    ADJUSTMENT   // manual correction
}