import React from "react";
import { PageHeader } from "../../../components/ui/PageHeaderComponent";
import { CardComponent } from "../../../components/ui/CardComponent";
import { Layout } from "../../../components/LayoutComponent";

const FileListPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <PageHeader title="Gerenciamento de Arquivos" />
        <CardComponent>
          <div className="text-center text-gray-500 py-10">
            <p>Nenhum arquivo cadastrado ainda.</p>
            {/* Aqui futuramente vai a tabela/listagem de arquivos */}
          </div>
        </CardComponent>
      </div>
    </Layout>
  );
};

export default FileListPage;
