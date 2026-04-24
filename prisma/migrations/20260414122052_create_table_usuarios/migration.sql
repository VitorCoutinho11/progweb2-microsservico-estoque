-- CreateTable
CREATE TABLE `Estoque` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produtoId` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 0,
    `quantidadeMinima` INTEGER NOT NULL DEFAULT 0,
    `localizacao` VARCHAR(120) NULL,
    `observacao` TEXT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT TRUE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Estoque_produtoId_idx`(`produtoId`),
    UNIQUE INDEX `Estoque_produto_localizacao_key`(`produtoId`, `localizacao`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
