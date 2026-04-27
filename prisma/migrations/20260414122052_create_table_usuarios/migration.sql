CREATE TABLE `Estoque` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produtoId` INTEGER NOT NULL, -- Referência lógica (ID que vem da API do seu amigo)
    `sectionId` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 0,
    `quantidadeMinima` INTEGER NOT NULL DEFAULT 0,
    `observacao` TEXT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT TRUE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `Estoque_produtoId_idx`(`produtoId`),
    INDEX `Estoque_sectionId_idx`(`sectionId`),
    UNIQUE INDEX `Estoque_produto_section_key`(`produtoId`, `sectionId`),

    PRIMARY KEY (`id`)
    -- Removi as Constraints de Foreign Key para permitir bancos separados
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;