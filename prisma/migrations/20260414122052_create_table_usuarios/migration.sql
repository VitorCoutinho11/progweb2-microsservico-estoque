-- Nova versão da tabela Estoque
CREATE TABLE `Estoque` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    `produtoId` INTEGER NOT NULL,
    `sectionId` INTEGER NOT NULL,

    `quantidade` INTEGER NOT NULL DEFAULT 0,
    `quantidadeMinima` INTEGER NOT NULL DEFAULT 0,

    `observacao` TEXT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT TRUE,

    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Estoque_produtoId_idx`(`produtoId`),
    INDEX `Estoque_sectionId_idx`(`sectionId`),

    -- evita duplicar produto na mesma seção
    UNIQUE INDEX `Estoque_produto_section_key`(`produtoId`, `sectionId`),

    PRIMARY KEY (`id`),

    CONSTRAINT `Estoque_produto_fk`
        FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT `Estoque_section_fk`
        FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;